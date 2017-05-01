var axios = require('axios');

var id = 'e662fed0c6c236f28cb3';
var sec = '20cc2bc51cf75268295afa919d467d93d2317430';
var params = '?client_id=' + id + '&client_secret=' + sec;

function getProfile(username) {
  return axios.get('https://api.github.com/users/' + username + params)
    .then(function(user) {
      return user.data;
    });
}

function getRepos(username) {
  return axios.get('https://api.github.com/users/' + username + '/repos'+ params + '&per_page=100');
}

function getStarCount(repos) {
  return repos.data.reduce(function (count, repo) {
    return count + repo.stargazers_count;
  }, 0);
}

function calculateScore(profile, repos) {
  var followers = profile.followers;
  var totalStars = getStarCount(repos);

  return (followers * 3) + totalStars;
}

function handleError(error) {
  console.warn(error);
  return null;
}

function getUserData(player) {
  return axios.all([
    getProfile(player),
    getRepos(player)
  ]).then(function (data){
    var profile = data[0];  //getProfile
    var repos = data[1];    //getRepos

    return {
      profile: profile,
      score: calculateScore(profile, repos)
    }
  })
}

function sortPlayers(players) {
  return players.sort(function(a, b) {
    return b.score - a.score;
  });
}

module.exports = {
  battle: function (players) {
    return axios.all(players.map(getUserData))
      .then(sortPlayers)
      .catch(handleError);
  },
  fetchPopularRepos: function (language) {
    var encodedURI = window.encodeURI('https://api.github.com/search/repositories?q=stars:>1+language:' + language + '&sort=stars&order=desc&type=Repositories');

    return axios.get(encodedURI)
      .then(function (response) {
        return response.data.items;
      });
  }
}
