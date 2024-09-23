let currentsong = new Audio();

let songs;
let currfolder;
async function getsongs(folder) {
  currfolder = folder;
  console.log(folder)
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1])
    }
  }

  let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
  songUL.innerHTML = ""
  for (const song of songs) {
    songUL.innerHTML = songUL.innerHTML + `
        <li>
                     <img class="invert" src="music-svgrepo-com.svg" alt="">
                        <div class="info">
                            <div>${song.replaceAll("%20", " ")}</div>
                            <div>abdul kalam</div>
                        </div>
                        <div class="playnow">
                              <span>play now</span>
                            <img class="invert" src="play-circle-svgrepo-com (1).svg" alt="">
                        </div>
         </li>`;
  }

  Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", element => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

    })
  })

}

function convertSecondsToMinutes(seconds) {
  // Calculate minutes and remaining seconds

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // Format minutes and seconds with leading zeros if needed
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

  // Return the formatted string
  return `${formattedMinutes}:${formattedSeconds}`;
}

const playMusic = (track, pause = false) => {
  // let audio=new Audio("/songs/"+track);
  currentsong.src = `/${currfolder}/` + track;
  if (!pause) {
    currentsong.play();
    play.src = "pause.svg"

  }
  currentsong.play()
  document.querySelector(".songinfo").innerHTML = decodeURI(track)
  document.querySelector(".songtime").innerHTML = "00:00/00:00"

}

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:3000/songs/`)
  let response = await a.text();
  let div = document.createElement("div")
  div.innerHTML = response;
  let anchor = div.getElementsByTagName("a")
  let cardcontainer = document.querySelector(".cardcontainer")
  let array = Array.from(anchor)
  for (let index = 0; index < array.length; index++) {
    const e = array[index];


    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0]

      let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
      let response = await a.json();
      console.log(response)
      cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="ncs" class="card">
                        <div  class="play">
                            <img src="play-svgrepo-com.svg" alt="Image">
                        </div>
                        <img src="/songs/ncs/cover.jpg"
                            alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
    }
  }
}



async function main() {

  await getsongs("songs/ncs");
  playMusic(songs[0], true)
  displayAlbums()



  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play()
      play.src = "pause.svg"
    } else {
      currentsong.pause()
      play.src = "play-circle-svgrepo-com (1).svg"
    }
  })

  currentsong.addEventListener("timeupdate", () => {

    document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutes(currentsong.currentTime)}/${convertSecondsToMinutes(currentsong.duration)}`
    document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
  })

  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = currentsong.duration * percent / 100;
  })

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  })

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120" + "%";
  })


  previous.addEventListener("click", () => {

    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if ((index - 1) >= 0) {
      playMusic(songs[index + 1])
    }
  })
  next.addEventListener("click", () => {

    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if ((index + 1) > length) {
      playMusic(songs[index + 1])
    }
  })

  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    console.log(e, e.target.value);
    currentsong.volume = parseInt(e.target.value) / 100;
  })

  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      console.log(item.currentTarget.dataset)
      songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)

    })
  })
}
main()
