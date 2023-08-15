"use strict";

const MissingImgURL = "https://tinyurl.com/missing-tv"

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $episodes = $('#episodesList');


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(search) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const res = await axios.get('http://api.tvmaze.com/search/shows', {params : {q : search}})
  // console.log(res.data)
  return res.data.map(res => {
    const show = res.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image ? show.image.medium : MissingImgURL,
    };
  });
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button id="episodes" class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const search = $("#searchForm-term").val();
  const shows = await getShowsByTerm(search);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) { 
  const url = `http://api.tvmaze.com/shows/${id}/episodes`
  const res = await axios.get(url)
  return res.data.map(episode => ({
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number
    }));
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes) { 
    $episodes.empty();
    for(let episode of episodes){
      const $episode = $(
        `<li id="${episode.id}">${episode.name} (season ${episode.season}, episode${episode.number})</li>`
      );
      $episodes.append($episode);
    }
    $episodesArea.show();
}

async function getAndDisplayEpisodes(e) {
  const showId = $(e.target).closest('.Show').data('show-id');
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
}

$showsList.on('click', ".Show-getEpisodes", getAndDisplayEpisodes);