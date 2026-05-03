import { Component, computed, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { LucideAngularModule, Search, X, Check, Activity, Shield, Users, Crosshair, Star, AlertCircle, User, Download, Zap, Brain, TrendingUp, Target, Sparkles, Play, HelpCircle } from 'lucide-angular';
import { PLAYERS_DATA } from './players.data';
import { GeminiService } from './gemini.service';

export interface Player {
  id: number;
  name: string;
  role: 'BAT' | 'BOWL' | 'AR' | 'WK';
  cost: number;
  image: string;
  isOverseas?: boolean;
  stats?: { matches?: number; runs?: number; strikeRate?: number; wickets?: number; economy?: number; };
  attributes?: { batting?: number; bowling?: number; fielding?: number; experience?: number; };
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, LucideAngularModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly LucideIcons = { Search, X, Check, Activity, Shield, Users, Crosshair, Star, AlertCircle, User, Download, Zap, Brain, TrendingUp, Target, Sparkles, Play, HelpCircle };

  // ── Auth ──────────────────────────────────────
  isLoggedIn = signal<boolean>(false);
  franchiseName = signal<string>('');
  passcode = signal<string>('');

  // ── Navigation ────────────────────────────────
  isSidebarCollapsed = signal<boolean>(false);
  activeTab = signal<string>('War Room');

  // ── Rival Tracker ─────────────────────────────
  rivalFranchises = signal([
    { name: 'Delhi Dynamos',    purse: 42.5, squadSize: 4, isBidding: true,  trend: '+2', color: '#f43f5e' },
    { name: 'Mumbai Mavericks', purse: 14.5, squadSize: 8, isBidding: false, trend: '=',  color: '#fbbf24' },
    { name: 'Bangalore Bolts',  purse: 61.0, squadSize: 2, isBidding: false, trend: '-1', color: '#a78bfa' },
    { name: 'Kolkata Kings',    purse: 33.0, squadSize: 5, isBidding: true,  trend: '+3', color: '#34d399' },
  ]);

  // ── Player Pool ────────────────────────────────
  playerPool = signal<Player[]>(PLAYERS_DATA);
  searchQuery = signal<string>('');
  activeFilter = signal<'ALL' | 'BAT' | 'BOWL' | 'AR' | 'WK'>('ALL');

  // ── Squad ──────────────────────────────────────
  squad = signal<Player[]>([]);
  maxBudget = 100.0;

  // ── Simulation ────────────────────────────────
  isSimulating = signal<boolean>(false);
  simulationLog = signal<string[]>([]);

  // ── Lock Squad ────────────────────────────────
  squadLocked = signal<boolean>(false);
  shareLink = signal<string>('');
  showCopied = signal<boolean>(false);

  // ── Help Modal ────────────────────────────────
  showHelp = signal<boolean>(false);

  // ── Scouting ──────────────────────────────────
  scoutingQuery = signal<string>('');
  scoutingResult = signal<string>('');
  isScoutingLoading = signal<boolean>(false);

  // ── Computed ───────────────────────────────────
  budgetSpent = computed(() => this.squad().reduce((sum, p) => sum + p.cost, 0));
  budgetRemaining = computed(() => this.maxBudget - this.budgetSpent());
  budgetPercentage = computed(() => Math.min((this.budgetSpent() / this.maxBudget) * 100, 100));
  isSquadFull = computed(() => this.squad().length >= 11);

  filteredPlayers = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const f = this.activeFilter();
    return this.playerPool().filter(p => {
      const matchSearch = p.name.toLowerCase().includes(q);
      const matchRole = f === 'ALL' || p.role === f;
      const notInSquad = !this.squad().find(sp => sp.id === p.id);
      return matchSearch && matchRole && notInSquad;
    });
  });

  scoutingFilteredPlayers = computed(() => {
    const q = this.scoutingQuery().toLowerCase();
    if (!q) return this.playerPool().slice(0, 20);
    return this.playerPool().filter(p =>
      p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q)
    );
  });

  // ── Charts ────────────────────────────────────
  public radarChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: 'rgba(255,255,255,0.1)' },
        grid: { color: 'rgba(255,255,255,0.1)' },
        pointLabels: { color: '#22d3ee', font: { family: 'Inter', size: 11, weight: 'bold' } },
        ticks: { display: false },
        max: 10, min: 0
      }
    },
    plugins: { legend: { display: false } }
  };
  public radarChartType: ChartType = 'radar';

  radarChartData = computed<ChartData<'radar'>>(() => {
    const sq = this.squad();
    const bats = sq.filter(p => p.role === 'BAT' || p.role === 'WK' || p.role === 'AR').length;
    const pace = sq.filter(p => p.role === 'BOWL' || p.role === 'AR').length;
    const spin = sq.filter(p => p.role === 'BOWL' || p.role === 'AR').length * 0.8;
    const ars  = sq.filter(p => p.role === 'AR').length * 2.5;
    const wk   = sq.filter(p => p.role === 'WK').length * 10;
    return {
      labels: ['Batting Depth', 'Pace Attack', 'Spin Variety', 'All-Rounders', 'Keeping'],
      datasets: [{
        data: [Math.min(bats*1.5,10), Math.min(pace*2,10), Math.min(spin*2,10), Math.min(ars,10), Math.min(wk,10)],
        label: 'Team Balance',
        backgroundColor: 'rgba(34, 211, 238, 0.2)',
        borderColor: 'rgba(34, 211, 238, 1)',
        pointBackgroundColor: 'rgba(34, 211, 238, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(34, 211, 238, 1)',
      }]
    };
  });

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#cbd5e1', font: { family: 'Inter', size: 12 } } }
    }
  };
  public pieChartType: ChartType = 'pie';

  pieChartData = computed<ChartData<'pie'>>(() => {
    const sq = this.squad();
    return {
      labels: ['Batters', 'Bowlers', 'All-Rounders', 'Keepers'],
      datasets: [{
        data: [sq.filter(p=>p.role==='BAT').length, sq.filter(p=>p.role==='BOWL').length, sq.filter(p=>p.role==='AR').length, sq.filter(p=>p.role==='WK').length],
        backgroundColor: ['#38bdf8','#fbbf24','#a78bfa','#34d399'],
        borderColor: '#0f172a',
        borderWidth: 2
      }]
    };
  });

  // ── Gemini ────────────────────────────────────
  aiCritique = signal<string>('Assemble your full 11-man squad to receive the AI Coach Critique.');
  isAnalyzing = signal<boolean>(false);
  deepInsights = signal<string>('');
  isGeneratingInsights = signal<boolean>(false);

  private geminiService = inject(GeminiService);

  constructor() {
    effect(() => {
      const sq = this.squad();
      if (sq.length === 11 && this.budgetRemaining() >= 0) {
        setTimeout(() => this.analyzeSquadWithGemini(), 0);
      } else if (sq.length < 11) {
        this.aiCritique.set('Assemble your full 11-man squad to receive the AI Coach Critique.');
      } else if (this.budgetRemaining() < 0) {
        this.aiCritique.set('You are over budget! Adjust your squad to meet the franchise limits.');
      }
    });
  }

  // ── Gemini Methods ────────────────────────────
  async analyzeSquadWithGemini() {
    if (this.isAnalyzing()) return;
    this.isAnalyzing.set(true);
    this.aiCritique.set('Gemini AI is analyzing your squad composition...');
    try {
      const critique = await this.geminiService.getCritique(this.squad());
      this.aiCritique.set(critique);
    } catch (err: any) {
      this.aiCritique.set(`Error: ${err.message}. Make sure the backend server is running on port 3001.`);
    } finally {
      this.isAnalyzing.set(false);
    }
  }

  async generateDeepInsights() {
    if (this.isGeneratingInsights() || this.squad().length === 0) return;
    this.isGeneratingInsights.set(true);
    this.deepInsights.set('');
    try {
      const insights = await this.geminiService.getInsights(this.squad());
      this.deepInsights.set(insights);
    } catch (err: any) {
      this.deepInsights.set(`Error: ${err.message}. Make sure the backend server is running on port 3001.`);
    } finally {
      this.isGeneratingInsights.set(false);
    }
  }

  async runScoutingQuery() {
    if (!this.scoutingQuery().trim() || this.isScoutingLoading()) return;
    this.isScoutingLoading.set(true);
    this.scoutingResult.set('');
    try {
      const result = await this.geminiService.scoutPlayer(this.scoutingQuery(), this.squad());
      this.scoutingResult.set(result);
    } catch (err: any) {
      this.scoutingResult.set(`Error: ${err.message}`);
    } finally {
      this.isScoutingLoading.set(false);
    }
  }

  // ── Simulation ────────────────────────────────
  startSimulation() {
    if (this.squad().length < 3) {
      alert('Add at least 3 players before starting simulation.');
      return;
    }
    this.isSimulating.set(true);
    this.simulationLog.set([]);
    this.activeTab.set('Simulation');
    const player = this.squad()[0];
    const rival = this.rivalFranchises()[0];
    const events = [
      `🏏 Auction simulation started for ${this.franchiseName()}!`,
      `📢 Bidding opens on ${player?.name ?? 'Player 1'}...`,
      `💰 ${rival.name} opens bid at ₹${((player?.cost ?? 5) * 0.7).toFixed(1)} CR`,
      `⚡ ${this.franchiseName()} counters at ₹${((player?.cost ?? 5) * 0.9).toFixed(1)} CR`,
      `🔨 ${this.franchiseName()} wins ${player?.name ?? 'Player 1'} at ₹${player?.cost} CR!`,
      `💰 Purse remaining: ₹${this.budgetRemaining().toFixed(1)} CR`,
      `✅ Simulation complete! Your squad has been finalized.`
    ];
    let i = 0;
    const interval = setInterval(() => {
      this.simulationLog.update(log => [...log, events[i]]);
      i++;
      if (i >= events.length) { clearInterval(interval); this.isSimulating.set(false); }
    }, 900);
  }

  // ── Lock Squad ────────────────────────────────
  lockSquad() {
    if (!this.isSquadFull() || this.budgetRemaining() < 0) return;
    this.squadLocked.set(true);
    const squadData = encodeURIComponent(JSON.stringify({
      franchise: this.franchiseName(),
      budget: this.budgetSpent(),
      squad: this.squad().map(p => ({ name: p.name, role: p.role, cost: p.cost }))
    }));
    const link = `${window.location.origin}${window.location.pathname}?squad=${squadData}`;
    this.shareLink.set(link);
    navigator.clipboard.writeText(link).catch(() => {});
  }

  copyLink() {
    navigator.clipboard.writeText(this.shareLink()).then(() => {
      this.showCopied.set(true);
      setTimeout(() => this.showCopied.set(false), 2000);
    }).catch(() => {});
  }

  // ── Helpers ───────────────────────────────────
  setFilter(filter: string) { this.activeFilter.set(filter as any); }

  exportData() {
    const data = { franchise: this.franchiseName(), budgetUsed: this.budgetSpent(), squad: this.squad() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.franchiseName() || 'franchise'}_squad.json`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  handleLogin() {
    if (this.franchiseName().trim().length > 0) this.isLoggedIn.set(true);
  }

  addPlayer(player: Player) {
    if (this.isSquadFull()) return;
    this.squad.update(s => [...s, player]);
  }

  removePlayer(player: Player) {
    this.squad.update(s => s.filter(p => p.id !== player.id));
  }

  getRoleColor(role: string) {
    switch(role) {
      case 'BAT':  return 'role-bat';
      case 'BOWL': return 'role-bowl';
      case 'AR':   return 'role-ar';
      case 'WK':   return 'role-wk';
      default:     return 'role-default';
    }
  }

  getBudgetBarColor() {
    const pct = this.budgetPercentage();
    if (pct > 100) return 'bg-rose';
    if (pct > 85)  return 'bg-amber';
    return 'bg-emerald';
  }
}
