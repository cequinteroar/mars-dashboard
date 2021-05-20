// const { default: fetch } = require("node-fetch");

// let store = Immutable.Map({
//     user: { name: "Student" },
//     apod: '',
//     rovers: ['Curiosity', 'Opportunity', 'Spirit'],
//     metadata: '',
//     photos: [],
// })


let store = {
    user: { name: "Student" },
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    metadata: '',
    photos: '',
    selectedRover: 'Curiosity',
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}


// create content
const App = (state) => {
    let { rovers, apod, metadata, photos, selectedRover } = state;

    return `
        <header></header>
        <main>
            ${Greeting(store.user.name)}
            <section>
            ${radioButtons(selectedRover)}
            </section>
            ${selectedRover === "Image" ? renderImage(apod) : roverSuite(metadata, photos, selectedRover)}
        </main>
        <footer></footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store);

    //  Start point for dashboard information
    if (store.selectedRover !== "Image") {
        getRoverMetadata(store.metadata, "Curiosity");
        getRoverLastPhotos(store.photos, "Curiosity");
    }
    document.body.addEventListener("change", (event) => {
        if (event.target.name === "landrover")
            selectRovers(event.target.value);
    });
})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1 class="banner">Welcome, ${name}! to the ICOS Mars Rover Dashboards</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}

const photoHide = () => {
    let i;
    const x = document.getElementsByClassName("roverPhoto");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
}

const radioButtons = (selectedRover) => {
    return (`
        <div class="radio-container">
            <label class="radio-inline" for="radio-image">
                <input type="radio" id="radio-image" name="landrover" value="Image" >I
            </label>

            <label class="radio-inline" for="radio-curiosity">
                <input type="radio" id="radio-curiosity" name="landrover" value="Curiosity" >C
            </label>
            
            <label class="radio-inline" for="radio-opportunity">
                <input type="radio" id="radio-opportunity" name="landrover" value="Opportunity">O
            </label>

            <label class="radio-inline" for="radio-spirit">
                <input type="radio" id="radio-spirit" name="landrover" value="Spirit">S
            </label>  
        </div>  
    `)
}


const renderImage = (apod) => {
    return (`    
        <section>
            <h3>Image of the day</h3>
            <p>
                One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                but generally help with discoverability of relevant imagery.
            </p>
            ${ImageOfTheDay(apod)}
        </section>
    `)
}

//  Function to update the rover info and photos
const selectRovers = (rover) => {
    updateStore(store, { selectedRover: rover });
    if (rover === "Image") {
        getImageOfTheDay(store);
    } else {
        getRoverMetadata(store.metadata, rover);
        getRoverLastPhotos(store.photos, rover);
    }
}

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date)
    console.log(photodate.getDate(), today.getDate());

    console.log(photodate.getDate() === today.getDate());
    if (apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        if (!apod.image)
            return;

        return (`
            <img class="image-day" src="${apod.image.url}" />
            <p>${apod.image.explanation}</p>
        `)
    }
}

const specificRoverData = (metadata) => {

    const metaInfo = metadata.roverData.photo_manifest;

    return (`
        <p>The landrover ${metaInfo.name} provides this useful information:</p>
        <ul>
            <li>Landing date: ${metaInfo.landing_date}</li>
            <li>Launch date: ${metaInfo.launch_date}</li>
            <li>Status: ${metaInfo.status}</li>
            <li>Total number of photos taken: ${metaInfo.total_photos}</li>
            <li>Martian rotation or day (sol): ${metaInfo.max_sol}</li>
        </ul>    
    `)
}

const specificRoverPhotos = (photos) => {

    const roverPhotos = photos.roverPhotos.latest_photos;

    return (`
            <div class="rover-image">            
                ${roverPhotos.map(photo => `<img class="rover-photo" src="${photo.img_src}"  />`)}
            </div>
        `)
}

const roverSuite = (metadata, photos, selectedRover) => {
    return (`
        <section>
            <h1>Metadata from mars landrovers</h1>

            <h2>${selectedRover}</h2>
            ${specificRoverData(metadata)}
            ${specificRoverPhotos(photos)}
        </section>    
    `)
}

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
    let { apod } = state

    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))
}

//  Get Rover metadata
const getRoverMetadata = (state, rover) => {
    let { metadata } = state;
    fetch(`http://localhost:3000/rover-data/${rover}`)
        .then(res => res.json())
        .then(metadata => updateStore(store, { metadata }));
}

//  Get Rover last photos
const getRoverLastPhotos = (state, rover) => {
    let { photos } = state;
    fetch(`http://localhost:3000/rover-photos/${rover}`)
        .then(res => res.json())
        .then(photos => updateStore(store, { photos }));
}
