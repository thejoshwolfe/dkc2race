
window.APP = window.angular.module('main', []).controller('MainCtrl', function($scope) {
  var happyFunTimeAudio = new Audio("mario-kart.ogg");
  var mood_music_audio = new Audio("wrong-game.ogg");
  mood_music_audio.loop = true;
  var huzzah_audio = [
    new Audio("diddywins.ogg"),
    new Audio("dixiewins.ogg"),
  ];
  var requestAnimationFrame = window.requestAnimationFrame;

  $scope.state = {
    people: [
      {
        name: "Josh",
        times: [],
        profile_img: "img/faces/josh_wolfe.png",
      },
      {
        name: "Kyle",
        times: [],
        profile_img: "img/faces/kyle.png",
      },
      {
        name: "Lukas",
        times: [],
        profile_img: "http://media.steampowered.com/steamcommunity/public/images/avatars/22/22810a6ecd7c4532209c4606ae0b9d95bc5898db_full.jpg",
      },
      {
        name: "Sam",
        times: [],
        profile_img: "img/faces/sam.png",
      },
    ],
    gameState: 'setup',
    checkpoints: [
      {
        name: "Gangplank Galleon",
        img_src: "img/krow.png",
      },
      {
        name: "Crocodile Cauldron",
        img_src: "img/kleaver.png",
      },
      {
        name: "Krem Quay",
        img_src: "img/kudgel.png",
      },
      {
        name: "Krazy Kremland",
        img_src: "img/kingzing.png",
      },
      {
        name: "Gloomy Gulch",
        img_src: "img/kreepykrow.png",
      },
      {
        name: "K. Rool",
        img_src: "img/krool.png",
      },
    ],
    current_checkpoint: 0,
  };

  $scope.addPerson = function() {
    $scope.state.people.push({name: "new person", times: []});
    saveState();
  };

  $scope.save = function() {
    saveState();
  };

  $scope.deletePerson = function(index) {
    $scope.state.people.splice(index, 1);
    saveState();
  };

  $scope.startGame = function() {
    $scope.state.gameState = 'race';
    saveState();
  };

  $scope.backToSetup = function() {
    $scope.state.gameState = 'setup';
    saveState();
  };

  $scope.readyToStart = function() {
    if ($scope.state.gameState !== "race") return false;
    if (!$scope.currentCheckpoint()) return false;
    return !$scope.theClockIsTicking();
  };

  $scope.theClockIsTicking = function() {
    if ($scope.state.gameState !== "race") return false;
    if (!$scope.currentCheckpoint())       return false;
    if (!$scope.currentCheckpoint().start) return false;
    return $scope.state.people.some(function(person) {
      return !person.times[$scope.state.current_checkpoint];
    });
  };

  $scope.isGameOver = function() {
    if ($scope.state.gameState !== "race") return false;
    return !$scope.currentCheckpoint();
  };

  $scope.currentCheckpoint = function() {
    return $scope.state.checkpoints[$scope.state.current_checkpoint];
  };

  $scope.readySetGo = function() {
    var checkpoint = $scope.currentCheckpoint();
    // mario kart gives an 8 second count down
    checkpoint.start = new Date(new Date().getTime() + 8000);
    saveState();
    happyFunTimeAudio.play();
  };

  $scope.personIsDone = function(person) {
    var checkpoint_index = $scope.state.current_checkpoint;
    var checkpoint = $scope.currentCheckpoint();
    var end_time = new Date();
    person.times[checkpoint_index] = end_time - checkpoint.start;
    var all_done = $scope.state.people.every(function(person) {
      return !!person.times[checkpoint_index];
    });
    if (all_done) {
      $scope.state.current_checkpoint += 1;
    }
    saveState();
    var audio = huzzah_audio[Math.floor(Math.random() * 2)];
    audio.play();
  };

  $scope.totalTime = function(person) {
    var total_time = 0;
    person.times.forEach(function(time) {
      if (time) total_time += time;
    });
    return total_time;
  };

  $scope.rupeesForCheckpoint = function(person, checkpoint_index) {
    return rupeesForSomething(person, function(person) {
      return person.times[checkpoint_index];
    });
  };

  function rupeesForSomething(person, timeForPerson) {
    var my_time = timeForPerson(person);
    if (!my_time) return "";
    var rupees = 0;
    $scope.state.people.forEach(function(other) {
      var their_time = timeForPerson(other);
      if (!their_time || my_time < their_time) rupees += 1;
    });
    return rupees;
  }

  $scope.rupeesForTotalTime = function(person) {
    return rupeesForSomething(person, function(person) {
      return $scope.totalTime(person);
    });
  };

  $scope.totalRupees = function(person) {
    var rupees = 0;
    var prt;
    for (var i = 0; i < $scope.state.checkpoints.length; i++) {
      prt = $scope.rupeesForCheckpoint(person, i);
      if (prt) rupees += prt;
    }
    prt = $scope.rupeesForTotalTime(person);
    if (prt) rupees += prt;
    return rupees;
  };

  loadState(localStorage.dkc2race);

  requestAnimationFrame(function animateClock() {
    var clock = document.getElementById("clock");
    var standby = document.getElementById("light-standby");
    var ready = document.getElementById("light-ready");
    var set = document.getElementById("light-set");
    var go = document.getElementById("light-go");

    var displayClock = false;
    var displayStandby = false;
    var displayReady = false;
    var displaySet = false;
    var displayGo = false;
    if ($scope.theClockIsTicking()) {
      var start = $scope.currentCheckpoint().start;
      var timeSinceStart = new Date() - start;
      clock.innerText = formatMs(timeSinceStart, true);

      displayStandby = timeSinceStart < -2000;
      displayReady = timeSinceStart >= -2000 && timeSinceStart < -1000;
      displaySet = timeSinceStart >= -1000 && timeSinceStart < 0;
      displayGo = timeSinceStart >= 0 && timeSinceStart < 2000;
      displayClock = timeSinceStart >= 0;
    }

    clock.style.display = displayClock ? "" : "none";
    standby.style.display = displayStandby ? "" : "none";
    ready.style.display = displayReady ? "" : "none";
    set.style.display = displaySet ? "" : "none";
    go.style.display = displayGo ? "" : "none";

    requestAnimationFrame(animateClock);
  });

  var save_textarea = document.getElementById("save_textarea");
  var lense_of_truth = document.getElementById("lense_of_truth");
  var load_state_button = document.getElementById("load_state_button");
  function hideState() {
    save_textarea.style.display = "none";
    load_state_button.style.display = "none";
    lense_of_truth.innerText = "Show State";
  }

  $scope.lenseOfTruth = function() {
    if (save_textarea.style.display === "none") {
      save_textarea.style.display = "";
      load_state_button.style.display = "";
      save_textarea.select();
      save_textarea.focus();
      lense_of_truth.innerText = "Hide State";
      document.body.scrollTop = 1e10;
    } else {
      hideState();
    }
  };

  function playPauseMusic() {
    if ($scope.state.gameState === "setup") {
      mood_music_audio.play();
    } else {
      mood_music_audio.pause();
    }
  }

  $scope.loadStateFromBox = function() {
    var text = save_textarea.value;
    var state;
    try {
      state = window.angular.fromJson(text);
    } catch (e) {
      return alert(e);
    }
    loadState(state);
    saveState();
    hideState();
  };

  function sortPeople() {
    // reorder everyone according to their wealth
    $scope.state.people.sort(function(person_a, person_b) {
      var a = $scope.totalRupees(person_a);
      var b = $scope.totalRupees(person_b);
      return a<b ? 1 : a>b ? -1 : 0;
    });
  }

  $scope.rank = function(targetPerson) {
    var lastRank = -1;
    var lastScore = Infinity;
    for (var i = 0; i < $scope.state.people.length; ++i) {
      var person = $scope.state.people[i];
      var score = $scope.totalRupees(person);
      if (score < lastScore) {
        lastRank = i;
        lastScore = score;
      }
      if (person === targetPerson) return rankToString(lastRank);
    }
  };

  function rankToString(index) {
    switch (index) {
      case 0: return "1st";
      case 1: return "2nd";
      case 2: return "3rd";
      case 20: return "21st";
      case 21: return "22nd";
      case 22: return "23rd";
      default: return (index + 1) + "th";
    }
  }

  function saveState() {
    sortPeople();
    localStorage.dkc2race = window.angular.toJson($scope.state);
    playPauseMusic();
  }

  $scope.prettyState = function() {
    return window.angular.toJson($scope.state, true);
  };

  function loadState(state) {
    if (state) {
      $scope.state = window.angular.fromJson(state);
      $scope.state.checkpoints.forEach(function(checkpoint) {
        if (checkpoint.start) checkpoint.start = new Date(checkpoint.start);
      });
      sortPeople();
    }
    playPauseMusic();
  }

  $scope.resetState = function() {
    if (confirm("delete all 50 states?")) {
      delete localStorage.dkc2race;
      location.href = location.href;
    }
  };

  function currentTitle() {
    if ($scope.state.gameState === "race") {
      var checkpoint = $scope.currentCheckpoint();
      if (checkpoint) return checkpoint.name + " - DKC2 Race - ";
    }
    return "DKC2 Race - ";
  }

  var marqueeIndex = 0;
  updateTitle();
  setInterval(updateTitle, 200);
  function updateTitle() {
    var title = currentTitle();
    while (title.substr(marqueeIndex, 1) === " ") marqueeIndex += 1;
    document.title = title.substring(marqueeIndex) + title.substring(0, marqueeIndex)
    marqueeIndex = (marqueeIndex + 1) % title.length;
  }
});

function formatMs(ms, include_ms) {
  if (!ms) return "";
  var result = "";
  if (ms < 0) {
    result += "-";
    ms = -ms;
  }
  var hours = Math.floor(ms / (60 * 60 * 1000));

  var minutes = Math.floor((ms / 60000) % 60);
  if (minutes < 10) {
    minutes = "0" + minutes;
  }

  var seconds = Math.floor((ms / 1000) % 60);
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  result += hours + ":" + minutes + ":" + seconds;
  if (include_ms) {
    var millis = "" + (ms % 1000);
    while (millis.length < 3) millis = "0" + millis;
    result += "." + millis;
  }
  return result;
}

window.APP.filter('formatMs', function() {
  return formatMs;
});

window.APP.directive('rupeeDisplay', function() {
  return {
    template: '<div class="rupee-display"></div>',
    link: zelda,
    replace: true,
    scope: true,
  };
  function zelda($scope, elem, attrs) {
    refresh();
    $scope.$watch(refresh);

    function refresh() {
      var total = $scope.$eval(attrs.rupeeCount);
      elem[0].innerHTML = "";

      var units = [
        {name: "blue", value: 3},
        {name: "green", value: 2},
        {name: "red", value: 1},
      ];

      for (var i = 0; i < units.length; i++) {
        var number = Math.floor(total / units[i].value);
        total -= number * units[i].value;
        makeImgs(number, units[i].name);
      }

      function makeImgs(count, color_name) {
        for (var i = 0; i < count; i++) {
          elem.append('<img src="img/balloon-' + color_name + '.gif">');
        }
      }
    }
  }
});

window.APP.run();

