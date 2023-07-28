import axios from 'axios';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import Notiflix from 'notiflix';



const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadBtn = document.querySelector(`.load-more`);
let lightbox;

form.addEventListener('submit', onSearchForm);
loadBtn.addEventListener('click', loadItems);

let page = 1;
let name = ``;
loadBtn.style.display = `none`;


function updateGallery() {
    if (lightbox) {
        lightbox.refresh();
    }
}


async function fetchData(searchRequest, page = 1) {
    try {
        const API_KEY = '38482679-fa06f355fbbaefa388f4c969f';
        const URL = `https://pixabay.com/api/`;

        const response = await axios.get(`${URL}`, {
            params: {
                key: `${API_KEY}`,
                image_type: 'photo',
                orientation: 'horizontal',
                safesearch: 'true',
                q: `${searchRequest}`,
                page: `${page}`,
                per_page: 40,

            },
        });

        return response.data;

    } catch (error) {
        throw new Error(error);
    }
}


function renderMarkUp(arr) {
    const markUp = arr.hits.reduce((acc, hit) => {
        return (acc += `
         <div class="gallery_item">
          <a class="photo-card" href="${hit.largeImageURL}">
           <img class="gallery__img" src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy" />
         </a>
         <a class="info">
          <p class="info-item"> Likes:${hit.likes}</p>
          <p class="info-item"> Views:${hit.views}</p>
          <p class="info-item"> Comments:${hit.comments}</p>
          <p class="info-item"> Downloads:${hit.downloads}</p>
         </a>
        </div>
        `);
    }, ``);

    // gallery.innerHTML = '';
    gallery.innerHTML = markUp;

    if (arr.hits.length > 0) {
        loadBtn.style.display = ``;
    }

    else
    // ((Math.floor(arr.totalHits / 40) < page) && arr.hits.length != 0) 
    {
        loadBtn.style.display = 'none';
        Notiflix.Notify.info(
            "We're sorry, but you've reached the end of search results."
        );
    }


    updateGallery();
}



async function onSearchForm(eve) {
    cleanPage();
    eve.preventDefault();
    name = eve.currentTarget.elements.searchQuery.value.trim();

    if (!name) {
        Notiflix.Notify.warning(`Please choose the animal`);
    } else {
        try {
            const data = await fetchData(name, page);
            if (data.totalHits > 0 && page === 1) {
                Notiflix.Notify.info(`Hooray! We found ${data.totalHits} images.`);
            }

            if (data.totalHits === 0) {
                Notiflix.Notify.failure(
                    `Sorry, there are no images matching your search query. Please try again.`
                );
            }
            renderMarkUp(data);
        } catch (error) {
            Notiflix.Notify.warning(error.message);
        }
    }
}

function initLightbox() {
    lightbox = new SimpleLightbox('.gallery .photo-card', {
        captionType: 'attr',
        captionsData: 'alt',
        captionDelay: 250,
    });
}

initLightbox();

async function loadItems() {
    try {
        const data = await fetchData(name, page + 1);

        if (data.hits.length > 0) {
            page++;
            renderMarkUp(data);
        } else {
            loadBtn.style.display = 'none';
            Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
        }
    } catch (error) {
        Notiflix.Notify.warning(error.message);
    }
}

function cleanPage() {
    loadBtn.style.display = `none`;
    gallery.innerHTML = ``;
    page = 1;
}