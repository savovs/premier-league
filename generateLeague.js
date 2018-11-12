// The league table should contain the following information, sorted by rank:
//     rank
//     team name
//     total wins
//     total draws
//     total defeats
//     goals for
//     goal against
//     goal difference
//     points

// Rank is determined by points, then goal difference, then goals scored.

// Vlady Veselinov, Take Home Test, Tested on Node v11.1.0
const fs = require('fs')
const data = JSON.parse(fs.readFileSync('data.json'))

// Get matches and flatten them to 1 array
let matches = data.rounds.map(round => round.matches)
matches = [].concat(...matches)

const teams = {}

const defaultTeam = {
  name: 'Default Name',
  code: 'CCC',
  key: 'keyname',
  wins: 0,
  draws: 0,
  defeats: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalDifference: 0,
  points: 0,
}

function updateTeam(team, goalsFor = 0, goalsAgainst = 0) {
  const { key } = team

  const didWinNumber = goalsFor > goalsAgainst ? 1 : 0
  const didDrawNumber = goalsFor === goalsAgainst ? 1 : 0
  const didLoseNumber = goalsFor < goalsAgainst ? 1 : 0
  const goalDifference = goalsFor - goalsAgainst;
  let points = 0

  if (didWinNumber > 0) {
    points = 3
  } else if (didDrawNumber > 0) {
    points = 1
  }

  // Add team if missing
  if (!teams.hasOwnProperty(key)) {
    teams[key] = {
      ...defaultTeam,
      ...team,
      wins: didWinNumber,
      draws: didDrawNumber,
      defeats: didLoseNumber,
      goalsFor,
      goalsAgainst,
      goalDifference,
      points,
    }
  } else {
    const oldState = teams[key]
    console.log(oldState.goalsFor + goalsFor)

    teams[key] = {
      ...oldState,
      wins: oldState.wins + didWinNumber,
      draws: oldState.draws + didDrawNumber,
      defeats: oldState.defeats + didLoseNumber,
      goalsFor: oldState.goalsFor + goalsFor,
      goalsAgainst: oldState.goalsAgainst + goalsAgainst,
      goalDifference: oldState.goalDifference + goalDifference,
      points: oldState.points + points,
    }
  }
}

matches.forEach(match => {
  const { team1, team2, score1, score2 } = match

  updateTeam(team1, score1, score2)
  updateTeam(team2, score2, score1)
})

fs.writeFile('results.json', JSON.stringify(teams, null, 4), (error) => {
  if (error) {
    throw error;
  }

  console.log('Done. Look for results.json')
})

// console.log('\nTeams:\n', teams)