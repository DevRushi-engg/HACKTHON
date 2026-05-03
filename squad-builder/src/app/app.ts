import { Component, computed, signal, effect, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { LucideAngularModule, Search, X, Check, Activity, Shield, Users, Crosshair, Star, AlertCircle, User, Download, Zap, Brain, TrendingUp, Target, Sparkles, Play, HelpCircle } from 'lucide-angular';
import { PLAYERS_DATA } from './players.data';

export interface Player {
  id: number;
  name: string;
  role: 'BAT' | 'BOWL' | 'AR' | 'WK';
  cost: number;
  image: string;
  isOverseas?: boolean;
  stats?: {
    matches?: number;
    runs?: number;
    strikeRate?: number;
    wickets?: number;
    economy?: number;
  };
  attributes?: {
    batting?: number;
    bowling?: number;
    fielding?: number;
    experience?: number;
  };
}

const PLAYERS: Player[] = [
  { id: 1, name: 'V. Kohli', role: 'BAT', cost: 15.0, image: '' },
  { id: 2, name: 'S. Gill', role: 'BAT', cost: 12.0, image: '' },
  { id: 3, name: 'R. Sharma', role: 'BAT', cost: 14.0, image: '' },
  { id: 4, name: 'Y. Jaiswal', role: 'BAT', cost: 8.5, image: '' },
  { id: 5, name: 'S. Iyer', role: 'BAT', cost: 9.0, image: '' },
  { id: 6, name: 'R. Patidar', role: 'BAT', cost: 5.0, image: '' },
  { id: 7, name: 'R. Gaikwad', role: 'BAT', cost: 10.0, image: '' },
  { id: 8, name: 'S. Sudharsan', role: 'BAT', cost: 6.0, image: '' },
  { id: 9, name: 'T. Varma', role: 'BAT', cost: 7.5, image: '' },
  { id: 10, name: 'R. Singh', role: 'BAT', cost: 8.0, image: '' },
  { id: 11, name: 'KL Rahul', role: 'WK', cost: 12.5, image: '' },
  { id: 12, name: 'R. Pant', role: 'WK', cost: 14.0, image: '' },
  { id: 13, name: 'S. Samson', role: 'WK', cost: 10.0, image: '' },
  { id: 14, name: 'I. Kishan', role: 'WK', cost: 11.0, image: '' },
  { id: 15, name: 'D. Karthik', role: 'WK', cost: 5.5, image: '' },
  { id: 16, name: 'P. Salt', role: 'WK', cost: 8.5, image: '' },
  { id: 17, name: 'Q. de Kock', role: 'WK', cost: 9.5, image: '' },
  { id: 18, name: 'H. Klaasen', role: 'WK', cost: 13.0, image: '' },
  { id: 19, name: 'N. Pooran', role: 'WK', cost: 12.0, image: '' },
  { id: 20, name: 'J. Buttler', role: 'WK', cost: 11.5, image: '' },
  { id: 21, name: 'H. Pandya', role: 'AR', cost: 15.0, image: '' },
  { id: 22, name: 'R. Jadeja', role: 'AR', cost: 14.0, image: '' },
  { id: 23, name: 'A. Patel', role: 'AR', cost: 11.0, image: '' },
  { id: 24, name: 'G. Maxwell', role: 'AR', cost: 10.5, image: '' },
  { id: 25, name: 'A. Russell', role: 'AR', cost: 12.0, image: '' },
  { id: 26, name: 'M. Stoinis', role: 'AR', cost: 9.5, image: '' },
  { id: 27, name: 'W. Sundar', role: 'AR', cost: 7.0, image: '' },
  { id: 28, name: 'S. Curran', role: 'AR', cost: 10.0, image: '' },
  { id: 29, name: 'L. Livingstone', role: 'AR', cost: 8.5, image: '' },
  { id: 30, name: 'C. Green', role: 'AR', cost: 13.5, image: '' },
  { id: 31, name: 'J. Bumrah', role: 'BOWL', cost: 15.0, image: '' },
  { id: 32, name: 'R. Khan', role: 'BOWL', cost: 14.5, image: '' },
  { id: 33, name: 'T. Boult', role: 'BOWL', cost: 10.0, image: '' },
  { id: 34, name: 'M. Shami', role: 'BOWL', cost: 11.0, image: '' },
  { id: 35, name: 'M. Siraj', role: 'BOWL', cost: 10.5, image: '' },
  { id: 36, name: 'Y. Chahal', role: 'BOWL', cost: 9.5, image: '' },
  { id: 37, name: 'K. Rabada', role: 'BOWL', cost: 10.0, image: '' },
  { id: 38, name: 'A. Singh', role: 'BOWL', cost: 9.0, image: '' },
  { id: 39, name: 'K. Yadav', role: 'BOWL', cost: 8.5, image: '' },
  { id: 40, name: 'M. Pathirana', role: 'BOWL', cost: 12.0, image: '' },
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, LucideAngularModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly LucideIcons = { Search, X, Check, Activity, Shield, Users, Crosshair, Star, AlertCircle, User, Download, Zap, Brain, TrendingUp, Target, Sparkles, Play, HelpCircle };
  
  isLoggedIn = signal<boolean>(false);
  franchiseName = signal<string>('');
  passcode = signal<string>('');
  
  isSidebarCollapsed = signal<boolean>(false);
  activeTab = signal<string>('War Room');
  
  rivalFranchises = [
    { name: 'Delhi Dynamos', purse: 42.5, squadSize: 4, isBidding: true },
    { name: 'Mumbai Mavericks', purse: 14.5, squadSize: 8, isBidding: false },
    { name: 'Bangalore Bolts', purse: 61.0, squadSize: 2, isBidding: false }
  ];

  // Using data loaded from ipl_auction_df.csv
  playerPool = signal<Player[]>(PLAYERS_DATA);
  
  searchQuery = signal<string>('');
  activeFilter = signal<'ALL' | 'BAT' | 'BOWL' | 'AR' | 'WK'>('ALL');
  
  squad = signal<Player[]>([]);
  maxBudget = 100.0;
  
  budgetSpent = computed(() => {
    return this.squad().reduce((sum, p) => sum + p.cost, 0);
  });
  
  budgetRemaining = computed(() => {
    return this.maxBudget - this.budgetSpent();
  });
  
  budgetPercentage = computed(() => {
    return Math.min((this.budgetSpent() / this.maxBudget) * 100, 100);
  });
  
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

  // Radar Chart config
  public radarChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: 'rgba(255,255,255,0.1)' },
        grid: { color: 'rgba(255,255,255,0.1)' },
        pointLabels: { color: '#22d3ee', font: { family: 'Inter', size: 11, weight: 'bold' } },
        ticks: { display: false },
        max: 10,
        min: 0
      }
    },
    plugins: {
      legend: { display: false }
    }
  };
  
  public radarChartType: ChartType = 'radar';
  
  radarChartData = computed<ChartData<'radar'>>(() => {
    const sq = this.squad();
    const bats = sq.filter(p => p.role === 'BAT' || p.role === 'WK' || p.role === 'AR').length;
    const pace = sq.filter(p => p.role === 'BOWL' || p.role === 'AR').length; // simple heuristic
    const spin = sq.filter(p => p.role === 'BOWL' || p.role === 'AR').length * 0.8; 
    const ars = sq.filter(p => p.role === 'AR').length * 2.5;
    const wk = sq.filter(p => p.role === 'WK').length * 10;
    
    return {
      labels: ['Batting Depth', 'Pace Attack', 'Spin Variety', 'All-Rounders', 'Keeping'],
      datasets: [
        {
          data: [Math.min(bats * 1.5, 10), Math.min(pace * 2, 10), Math.min(spin * 2, 10), Math.min(ars, 10), Math.min(wk, 10)],
          label: 'Team Balance',
          backgroundColor: 'rgba(34, 211, 238, 0.2)',
          borderColor: 'rgba(34, 211, 238, 1)',
          pointBackgroundColor: 'rgba(34, 211, 238, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(34, 211, 238, 1)',
        }
      ]
    };
  });
  
  aiCritique = signal<string>("Assemble your full 11-man squad to receive the AI Coach Critique.");
  isAnalyzing = signal<boolean>(false);

  constructor() {
    effect(() => {
      const sq = this.squad();
      if (sq.length === 11 && this.budgetRemaining() >= 0) {
        // Run analysis asynchronously so we don't block the effect
        setTimeout(() => this.analyzeSquadWithGemini(), 0);
      } else if (sq.length < 11) {
        this.aiCritique.set("Assemble your full 11-man squad to receive the AI Coach Critique.");
      } else if (this.budgetRemaining() < 0) {
        this.aiCritique.set("You are over budget! You must adjust your squad to meet the franchise limits.");
      }
    }, { allowSignalWrites: true });
  }

  async analyzeSquadWithGemini() {
    if (this.isAnalyzing()) return;
    this.isAnalyzing.set(true);
    this.aiCritique.set("Gemini AI is analyzing your squad composition...");

    try {
      const squadDetails = this.squad().map(p => `${p.name} (${p.role}, ₹${p.cost}CR)`).join(', ');
      const prompt = `You are an expert T20 cricket coach. Analyze this IPL squad and provide a quick 3-sentence critique focusing on team balance, strengths, and weaknesses: ${squadDetails}`;

      const apiKey = 'AIzaSyD7MiA0IaoO7cSOOs5M0DLSeRkFEg91bnI';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        // Clean up markdown bolding from response if any
        let text = data.candidates[0].content.parts[0].text.trim();
        text = text.replace(/\*\*/g, '');
        this.aiCritique.set(text);
      } else {
        this.aiCritique.set("Gemini AI analysis failed to return a critique.");
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      this.aiCritique.set("Error connecting to Gemini AI. Check console for details.");
    } finally {
      this.isAnalyzing.set(false);
    }
  }

  setFilter(filter: string) {
    this.activeFilter.set(filter as any);
  }

  exportData() {
    const data = {
      franchise: this.franchiseName(),
      budgetUsed: this.budgetSpent(),
      squad: this.squad()
    };
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.franchiseName() || 'franchise'}_squad.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  handleLogin() {
    if (this.franchiseName().trim().length > 0) {
      this.isLoggedIn.set(true);
    }
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
      case 'BAT': return 'role-bat';
      case 'BOWL': return 'role-bowl';
      case 'AR': return 'role-ar';
      case 'WK': return 'role-wk';
      default: return 'role-default';
    }
  }

  getBudgetBarColor() {
    const pct = this.budgetPercentage();
    if (pct > 100) return 'bg-rose';
    if (pct > 85) return 'bg-amber';
    return 'bg-emerald';
  }
}
