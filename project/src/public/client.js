const store = Immutable.Map({
    user: { name: "Dear Visitor" },
    apod: '',
    metadata: '',
    photos: '',
    selectedRover: 'Curiosity',
    iterator: 0
})


// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    const newStore = store.merge(store, newState);
    store = Object.assign(store, newStore)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}


// create content
const App = (appState) => {
    const user = appState.get('user');
    const selectedRover = appState.get('selectedRover');

    return `
        <header></header>
        <main>
            ${Greeting(user.name)}
            <section>
            ${radioButtons(selectedRover)}
            </section>
            ${renderContent(appState, selectedRover)}
        </main>
        <footer></footer>
    `
}

//  High Order Function to return the right content to render
const renderContent = (appState ,selectedRover) => {
    const apod = appState.get('apod');
    const metadata = appState.get('metadata');
    const photos = appState.get('photos');
    if(selectedRover === "Image")
        return renderImage(apod);
    else
        return roverSuite(metadata, photos, selectedRover);
}


// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store);

    //  Start point for dashboard information
    if (store.get('selectedRover') !== "Image") {
        getRoverMetadata("Curiosity");
        getRoverLastPhotos("Curiosity");
    }
    
    document.body.addEventListener("change", (event) => {
        if (event.target.name === "landrover"){
            selectRovers(event.target.value);
        }
    });

    document.body.addEventListener("click", (event) => {
        if (event.target.id === "photoplus")
            photoAdvance(1);
        if (event.target.id === "photominus")
            photoAdvance(-1);
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

//  Photo slider control
const photoAdvance = (value) => {
    let iter = 0;
    const storeIterator = store.get("iterator");
    const photos = store.get("photos");
    const latest_photos = photos.roverPhotos.latest_photos;
    if(storeIterator === latest_photos.length - 1 && value > 0){
        iter = 0
    }else{
        if (storeIterator <= latest_photos.length - 1)
            iter = storeIterator + value;
        if(storeIterator === 0 && value < 0)
            iter = latest_photos.length - 1;
    }
    const newStore = store.set("iterator", iter);
    updateStore(store, newStore)
}

//  ICOS selection system based on input radio buttons
const radioButtons = (selectedRover) => {
    return (`
        <div class="radio-container">
            <label class="radio-inline ${selectedRover === "Image" ? "test-style":""}" for="radio-image">
                <input  type="radio" id="radio-image" name="landrover" value="Image" >I
            </label>

            <label class="radio-inline ${selectedRover === "Curiosity" ? "test-style":""}" for="radio-curiosity">
                <input type="radio" id="radio-curiosity" name="landrover" value="Curiosity" >C
            </label>
            
            <label class="radio-inline ${selectedRover === "Opportunity" ? "test-style":""}" for="radio-opportunity">
                <input type="radio" id="radio-opportunity" name="landrover" value="Opportunity">O
            </label>

            <label class="radio-inline ${selectedRover === "Spirit" ? "test-style":""}" for="radio-spirit">
                <input type="radio" id="radio-spirit" name="landrover" value="Spirit">S
            </label>  
        </div>  
    `)
}

//  Render the image of the day
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
    const newStore = store.set("selectedRover", rover)
    updateStore(store, newStore);
    if (rover === "Image") {
        getImageOfTheDay();
    } else {
        getRoverMetadata(rover);
        getRoverLastPhotos(rover);
    }
}

// Image of the day section
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

//  Section to render the rover meta data
const specificRoverData = (metadata) => {

    if (!metadata || !metadata.roverData)
        return ``;

    const metaInfo = metadata.roverData.photo_manifest;
    let icon ="";
    switch(metaInfo.status){
        case "active":
            icon = '<i class="fas fa-wave-square"></i>';
            break;
        case "complete":
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        default:
            icon = '<i class="fas fa-times-circle"></i>';
            break;
    }

    return (`
        <p>The landrover ${metaInfo.name} provides this useful information:</p>
        <ul>
            <li><i class="fas fa-plane-arrival"></i> <b>Landing date:</b> ${metaInfo.landing_date}</li>
            <li><i class="fas fa-rocket"></i> <b>Launch date:</b> ${metaInfo.launch_date}</li>
            <li>${icon} <b>Status:</b> ${metaInfo.status}</li>
            <li><i class="far fa-images"></i> <b>Photos taken:</b> ${metaInfo.total_photos}</li>
            <li><i class="fas fa-calendar-day"></i> <b>Martian rotation or day (sol):</b> ${metaInfo.max_sol}</li>
        </ul>    
    `)
}

//  Section to render the rover photos
const specificRoverPhotos = (photos) => {

    if (!photos || !photos.roverPhotos)
        return ``;

    const roverPhotos = photos.roverPhotos.latest_photos;
    const iterator = store.get("iterator");
    const imgUrls = roverPhotos.map(photo => photo.img_src);

    return (`
            <div class="rover-image"> 
                <button class="select-btn" id="photominus" ${imgUrls.length === 1 ? "disabled":""}>\<</button>
                <img class="rover-photo" src="${imgUrls[iterator]}"  />
                <button class="select-btn" id="photoplus" ${imgUrls.length === 1 ? "disabled":""}>\></button>
            </div>
        `)
}

//  Section to show the data got from the API
const roverSuite = (metadata, photos, selectedRover) => {
    return (`
        <section>
            <h1 class="rover-name">${selectedRover}</h2>
            ${specificRoverData(metadata)}
            ${specificRoverPhotos(photos)}
        </section>    
    `)
}

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = () => {

    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => {
            const newStore = store.set("apod", apod);
            updateStore(store, newStore);
        })
        .catch(err => console.error(err));
}

//  Get Rover metadata
const getRoverMetadata = (rover) => {
    fetch(`http://localhost:3000/rover-data/${rover}`)
        .then(res => res.json())
        .then(metadata => {
            const newStore = store.set("metadata", metadata);
            updateStore(store, newStore);
        })
        .catch(err => console.error(err));
}

//  Get Rover last photos
const getRoverLastPhotos = async (rover) => {
    await fetch(`http://localhost:3000/rover-photos/${rover}`)
        .then(res => res.json())
        .then(photos => {
            const newStore = store.set("photos", photos).set("iterator", 0);
            updateStore(store, newStore)
        })
        .catch(err => console.error(err));
}
