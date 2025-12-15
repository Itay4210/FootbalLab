import type { Team } from '../services/api';

interface Props {
  teams: Team[];
  loading: boolean;
  leagueName?: string;
}

export const LeagueTable = ({ teams, loading, leagueName }: Props) => {
  const isChampionsLeague = 
    leagueName === 'Champions League' || 
    leagueName === 'Europe' || 
    leagueName?.includes('Champions');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
            <div className="text-4xl animate-bounce mb-4">⚽</div>
            <div className="text-lab-accent animate-pulse text-xl font-mono">Loading Data...</div>
        </div>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 border border-dashed border-slate-700 rounded-lg bg-slate-800/20">
        <div className="text-slate-400">No data available. Please run the simulation first.</div>
      </div>
    );
  }

  // =========================================================================
  // 🏆 תצוגת ליגת האלופות (ממוינת לפי שדה clGroup מה-Backend)
  // =========================================================================
  if (isChampionsLeague) {
    
    // 🔥 1. פיצול הקבוצות לפי שדה הבית (clGroup)
    // במקום לחתוך את הרשימה הכללית, אנחנו מקבצים אותן לפי השדה החדש שהגיע מה-DB.
    const teamsByGroup: { [key: string]: Team[] } = teams.reduce((acc, team) => {
        // ודא שהשדה clGroup קיים (כפי שעדכנו ב-Schema)
        const groupName = (team as any).clGroup || 'Z'; 
        if (!acc[groupName]) {
            acc[groupName] = [];
        }
        acc[groupName].push(team);
        return acc;
    }, {} as { [key: string]: Team[] });
    
    // 2. מיון הבתים לפי סדר אלפביתי (A, B, C, D, E)
    const sortedGroupNames = Object.keys(teamsByGroup).filter(name => name !== 'Z').sort();
    
    // 3. סידור 3 למעלה, 2 למטה
    const topRowGroups = sortedGroupNames.slice(0, 3);
    const bottomRowGroups = sortedGroupNames.slice(3, 5);
    
    // פונקציית עזר לרינדור כרטיס בית
    const renderGroupCard = (groupName: string) => {
        const groupTeams = teamsByGroup[groupName];
        if (!groupTeams || groupTeams.length === 0) return null;

        // 4. מיון סופי בתוך הבית: לפי נקודות ואז הפרש שערים
        const sortedInGroup = groupTeams.sort((a, b) => {
            if (b.seasonStats.points !== a.seasonStats.points) {
                return b.seasonStats.points - a.seasonStats.points;
            }
            const gdA = a.seasonStats.goalsFor - a.seasonStats.goalsAgainst;
            const gdB = b.seasonStats.goalsFor - b.seasonStats.goalsAgainst;
            return gdB - gdA;
        });

        return (
            <div key={groupName} className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden shadow-md hover:border-lab-accent transition-all duration-300 w-full">
                
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 py-2 px-3 border-b border-slate-600 flex justify-between items-center">
                    <h3 className="font-bold text-lab-accent text-base">Group {groupName}</h3>
                </div>

                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs uppercase bg-slate-900/60 text-gray-500 font-semibold">
                        <tr>
                            <th className="px-2 py-2 w-8 text-center">#</th>
                            <th className="px-2 py-2">Team</th>
                            <th className="px-1 py-2 text-center">W</th>
                            <th className="px-1 py-2 text-center">D</th>
                            <th className="px-1 py-2 text-center">L</th>
                            <th className="px-1 py-2 text-center">GD</th>
                            <th className="px-2 py-2 text-center text-white">Pts</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedInGroup.map((team, idx) => {
                            const goalDiff = (team.seasonStats.goalsFor || 0) - (team.seasonStats.goalsAgainst || 0);
                            let rowClass = "border-b border-slate-700/50 hover:bg-slate-700 transition-colors h-9"; 
                            
                            // הדגשת העולות (מקומות 1-2 בתוך הבית)
                            if (idx < 2) rowClass += " border-l-4 border-l-lab-accent bg-green-500/10";
                            else rowClass += " border-l-4 border-l-transparent";

                            return (
                                <tr key={team._id} className={rowClass}>
                                    <td className="px-1 text-center font-medium text-slate-500">{idx + 1}</td>
                                    <td className="px-2 font-bold text-gray-100 truncate max-w-[130px]" title={team.name}>
                                        {team.name}
                                    </td>
                                    <td className="px-1 text-center text-green-400">{team.seasonStats.wins}</td>
                                    <td className="px-1 text-center text-slate-500">{team.seasonStats.draws}</td>
                                    <td className="px-1 text-center text-red-400">{team.seasonStats.losses}</td>
                                    <td className="px-1 text-center text-slate-400 font-mono text-xs">{goalDiff > 0 ? `+${goalDiff}` : goalDiff}</td>
                                    <td className="px-2 text-center font-black text-lab-accent text-lg">{team.seasonStats.points}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
      <div className="animate-fade-in pb-8 flex flex-col gap-5">
        
        {/* שורה עליונה: A, B, C */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {topRowGroups.map(renderGroupCard)}
        </div>

        {/* שורה תחתונה: D, E - ממורכזים */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:w-3/4 lg:mx-auto">
            {bottomRowGroups.map(renderGroupCard)}
        </div>

      </div>
    );
  }

  // =========================================================================
  // 🌍 תצוגת ליגה רגילה (ללא שינוי)
  // =========================================================================
  return (
    <div className="overflow-hidden rounded-xl border border-slate-700 shadow-2xl bg-lab-card/30 backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs uppercase bg-slate-900 text-gray-300 border-b border-slate-700">
            <tr>
                <th className="px-6 py-4 font-bold tracking-wider">Pos</th>
                <th className="px-6 py-4 font-bold tracking-wider">Club</th>
                <th className="px-4 py-4 text-center">MP</th>
                <th className="px-4 py-4 text-center">W</th>
                <th className="px-4 py-4 text-center">D</th>
                <th className="px-4 py-4 text-center">L</th>
                <th className="px-4 py-4 text-center hidden sm:table-cell">GF</th>
                <th className="px-4 py-4 text-center hidden sm:table-cell">GA</th>
                <th className="px-4 py-4 text-center font-bold">GD</th>
                <th className="px-6 py-4 text-center font-black text-white text-base">Pts</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
            {teams.map((team, index) => {
                const goalDiff = (team.seasonStats.goalsFor || 0) - (team.seasonStats.goalsAgainst || 0);
                let rowClass = "hover:bg-slate-800/50 transition-all duration-200";
                
                if (index < 4) rowClass += " border-l-4 border-l-lab-accent bg-green-500/5";
                else if (index >= teams.length - 3) rowClass += " border-l-4 border-l-red-500 bg-red-500/5";
                else rowClass += " border-l-4 border-l-transparent";

                return (
                <tr key={team._id} className={rowClass}>
                    <td className="px-6 py-4 font-medium text-white">{index + 1}</td>
                    <td className="px-6 py-4 font-bold text-white text-base flex items-center gap-3">
                         {team.name}
                    </td>
                    <td className="px-4 py-4 text-center text-slate-400">{team.seasonStats.matches || 0}</td>
                    <td className="px-4 py-4 text-center text-green-400 font-medium">{team.seasonStats.wins || 0}</td>
                    <td className="px-4 py-4 text-center text-slate-500">{team.seasonStats.draws || 0}</td>
                    <td className="px-4 py-4 text-center text-red-400">{team.seasonStats.losses || 0}</td>
                    <td className="px-4 py-4 text-center hidden sm:table-cell">{team.seasonStats.goalsFor || 0}</td>
                    <td className="px-4 py-4 text-center hidden sm:table-cell">{team.seasonStats.goalsAgainst || 0}</td>
                    <td className="px-4 py-4 text-center font-mono text-slate-300 font-bold">
                    {goalDiff > 0 ? `+${goalDiff}` : goalDiff}
                    </td>
                    <td className="px-6 py-4 text-center font-black text-xl text-lab-accent drop-shadow-lg">
                    {team.seasonStats.points || 0}
                    </td>
                </tr>
                );
            })}
            </tbody>
        </table>
      </div>
    </div>
  );
};