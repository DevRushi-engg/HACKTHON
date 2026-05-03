const fs = require('fs');
const csv = fs.readFileSync('c:/Users/Asus/Desktop/HACKTHON/ipl_auction_df.csv', 'utf-8');
const lines = csv.trim().split('\n');
const headers = lines[0].split(',');

const players = lines.slice(1).map((line, i) => {
  const parts = line.split(',');
  const p = {};
  headers.forEach((h, j) => p[h.trim()] = parts[j].trim());
  
  let role = p.role;
  const roleMap = {
    'Batter': 'BAT',
    'Bowler': 'BOWL',
    'All-Rounder': 'AR',
    'Wicket-Keeper': 'WK'
  };
  
  if (roleMap[role]) {
    role = roleMap[role];
  } else {
    role = 'AR'; // fallback
  }

  return {
    id: i + 1,
    name: p.name,
    role: role,
    cost: parseFloat(p.base_price_crore),
    stats: {
      matches: parseInt(p.total_matches),
      runs: parseInt(p.total_runs),
      strikeRate: parseFloat(p.strike_rate),
      wickets: parseInt(p.total_wickets),
      economy: parseFloat(p.economy)
    },
    attributes: {
      batting: parseInt(p.batting_rating),
      bowling: parseInt(p.bowling_rating),
      fielding: parseInt(p.fielding_rating),
      experience: parseInt(p.experience_years)
    },
    image: '',
    isOverseas: p.overseas === 'True'
  };
});

fs.writeFileSync('c:/Users/Asus/Desktop/HACKTHON/squad-builder/src/app/players.data.ts', `import { Player } from './app';\n\nexport const PLAYERS_DATA: Player[] = ${JSON.stringify(players, null, 2)};`);
console.log("Data generated successfully");
