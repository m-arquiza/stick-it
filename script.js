/*  *.* GLOBAL VARS
    change: if change, stickyNums: current # of notes
*/
let change = false;
let stickyNums = 0;
let stickyUnique = 0;
let notes = [];
let links = [];



/*  *.* INITIAL INSTRUCTIONS
    fades instructions
*/
// Fades away initial instructions after clicks or if changed
document.body.addEventListener("click", function() {
    toFade(document.getElementsByClassName("create-info"));
    toFade(document.getElementsByClassName("link-info"));

    if(change){
        toFade(document.getElementsByClassName("trash-info"));
    }
});

// Fades initial instructions 10, 20, and 30 seconds respectively
setTimeout(function () {
    toFade(document.getElementsByClassName("create-info"));
}, 10000);
setTimeout(function () {
    toFade(document.getElementsByClassName("link-info"));
}, 20000);
setTimeout(function () {
    toFade(document.getElementsByClassName("trash-info"));
}, 30000);

// Helper method to fade a given array of objects.
function toFade(objects){
    for(let i = 0; i < objects.length; ++i){
        objects[i].classList.add("fade");
    }
}



/*  *.* POPUP
    popup appearance
*/

// Shows and hides input text popup. Alerts if note limit is reached.
document.getElementById("new-sticky").addEventListener("click", function(){
    if(stickyNums < 20) {
        document.getElementById("popup").style.display = "block";
    }else{
        alert("too many sticky notes! try deleting some first.")
    }
});
document.getElementById("popup-close").addEventListener("click", function(){
    document.getElementById("popup").style.display = "none";
});



/*  *.* POPUP & DRAG/DROP
    creating new or adding stored notes to document, drag and drop implementation
*/
// Creates and adds new sticky note to the body from input text.
document.getElementById("stick").addEventListener("click", function(){
    let textbox = document.getElementById("sticky-text");
    let text = textbox.value;
    if(checkUnique(text)){
        change = true;
        stickyNums++;
        stickyUnique++;

        textbox.value = "";

        notes.push([text, "0"]);
        let reminder = makeSticky(text, 0);
        document.body.appendChild(reminder);
        document.getElementById("popup").style.display = "none";
    }
});
// Creates and adds new sticky note to the body from text stored in local storage.
function addStorageSticky(text){
    let parse = JSON.parse(text);
    stickyNums++;
    stickyUnique++;

    let note = parse[0];
    let area = parse[1];
    notes.push([note, area]);
    let reminder = makeSticky(note, area);
    let areaID = document.getElementsByClassName("stickable area"+area);
    areaID[0].appendChild(reminder);
}
// Constructs and returns a sticky note using given text with ID and draggable attribtues.
function makeSticky(text, area){
    let reminder = document.createElement("span");
    reminder.textContent = text;
    reminder.setAttribute("class", "sticky-note");
    reminder.setAttribute("id", "sticky"+stickyUnique);
    reminder.setAttribute("data-area", area);

    reminder.setAttribute("draggable", "true");
    reminder.addEventListener("dragstart", function(event){
        event.dataTransfer.setData("text/HTML", event.target.id);
        shadow("add");
    });

    return reminder;
}


// Adds drag and drop attributes to applicable divs on the "table". Shadow appears when note is
// dragged and disappears when note is dropped on div.
let stickyareas = document.getElementsByClassName("stickable");
for(let i = 0; i < stickyareas.length; ++i){
    const area = stickyareas[i];

    area.addEventListener("dragover", function(event) {
        event.preventDefault();
    });

    area.addEventListener("drop", function(event) {
        if(area.children.length === 0){
            event.preventDefault();
            let data = event.dataTransfer.getData("text/HTML");
            let note = document.getElementById(data);
            let area = String(i+1);
            note.setAttribute("data-area", area);

            notes[notesIndex(note)][1] = area;
            event.target.appendChild(note);

            shadow("rm");

        }
    });

    area.addEventListener("dblclick", function(){
        let note = area.children;
        if(note.length > 0){
            let outer = document.createElement("div");
            outer.setAttribute("class", "zoom-table");
            outer.addEventListener("click", function (){
                outer.parentNode.removeChild(outer);
            });

            let current = document.createElement("span");
            current.setAttribute("class","zoom-note");
            current.textContent = note[0].textContent;

            let trashcan = document.createElement("div");
            trashcan.setAttribute("class","zoom-trash");
            trashcan.addEventListener("click", function (){
                deleteNote(note[0]);
            });

            let trashpaper = document.createElement("div");
            trashpaper.setAttribute("class","zoom-crumple");
            trashpaper.addEventListener("click", function (){
                deleteNote(note[0]);
            });

            outer.appendChild(trashpaper)
            outer.appendChild(trashcan)
            outer.appendChild(current);
            document.body.appendChild(outer);
        }
    })
}

// Removes shadow if note is dropped on body.
document.body.addEventListener("dragover", function(event) {
    event.preventDefault();
});
document.body.addEventListener("drop", function(event) {
    event.preventDefault();
    shadow("rm");

});

// Adds drag and drop attributes to trashcan and enables deletion.
const trashcan = document.getElementById("trashcan")
trashcan.addEventListener("dragover", function(event){
   event.preventDefault();
});
trashcan.addEventListener("drop", function(event){
    event.preventDefault();
    let note = document.getElementById(event.dataTransfer.getData("text/HTML"));

    deleteNote(note);
});

// Alerts user if there is a pre-existing note with same text.
function checkUnique(text){
    for(let i = 0; i < notes.length; ++i){
        if(notes[i][0] === text){
            return confirm("are you sure you want to create this note? " +
                "you already have already created an identical note.");
        }
    }
    return true;
}

// Helper method to delete a given note from table/screen.
function deleteNote(note){
    change = true;
    stickyNums--;

    notes.splice(notesIndex(note), 1);

    note.parentNode.removeChild(note);
}

// Helper method to show or hide note shadows using a given keyword.
function shadow(op){
    let stickyareas = document.getElementsByClassName("stickable");
    for(let i = 0; i < stickyareas.length; ++i){
        if(op === "add"){
            stickyareas[i].classList.add("show");
        }else{
            stickyareas[i].classList.remove("show");
        }
    }
}

// Helper method to get index of note in notes through note content.
function notesIndex(note){
    let text = note.textContent
    let index;
    for(let i = 0; i < notes.length; ++i){
        if(notes[i][0] === text){
            index = i;
        }
    }
    return index;
}


/*  *.* SIDEBAR BUTTONS
    save, clear, and load
*/
// Saves and overwrites all current sticky notes and hyperlinks to local storage.
document.getElementById("save").addEventListener("click", function(){
    change = false;
    localStorage.clear();
    for(let i = 0; i < notes.length; ++i) {
        let n_key = "note"+i;
        let toNote = [notes[i][0], notes[i][1]];
        localStorage.setItem(n_key, JSON.stringify(toNote));
    }
    for(let j = 0; j < links.length; ++j){
        let l_key = "link"+j;
        let toLink = [links[j][0], links[j][1], links[j][2]];
        localStorage.setItem(l_key, JSON.stringify(toLink));
    }
    fadeText("save-text");
});

// Indicates save or clear respectively was called.
function fadeText(name){
    let text = document.getElementsByClassName(name)[0];
    text.classList.add("inOut");
    setTimeout(function () {
        text.classList.remove("inOut");
    }, 1000);
}

// Clears all sticky notes and hyperlinks from screen and from local storage (with alert confirmation).
document.getElementById("clear").addEventListener("click", function() {
    if(confirm("are you sure you want to clear all sticky notes on the screen and in storage?" +
        " this will also clear all your saved hyperlinks." +
        "\n(tip: to delete a single sticky note, drag it over to the trash can!)")){
        change = false;

        localStorage.clear();
        stickyNums = 0;
        stickyUnique = 0;
        notes = [];
        links = []
        let stickyNotes = document.getElementsByClassName("sticky-note");
        while(stickyNotes.length){
            stickyNotes[0].parentNode.removeChild(stickyNotes[0]);
        }
        for(let i = 0; i < 6; ++i){
            updateLinks("", "", "\u{1F331}", i);
        }
    }
    fadeText("clear-text");
});

// Auto-loads saved hyperlinks and notes on window load.
window.onload = function() {
    for(let i = 0; i < localStorage.length; ++i) {
        let text = localStorage.getItem("note"+i);
        if(text){
            addStorageSticky(text);
        }
        let link = localStorage.getItem("link"+i);
        if(link){
            let parse = JSON.parse(link);
            updateLinks(parse[0], parse[1], "\u{1F338}", parse[2])
            links.push([parse[0], parse[1], parse[2]]);
        }
    }
};

// Alerts if user attempts to leave with possible unsaved changes.
window.onbeforeunload = function() {
    if(change){
        return true;
    }
};



/*  *.* HYPERLINK
    updates hyperlinks on user input
*/

// Takes user input from prompts and replaces specified hyperlink.
let sprouts = document.getElementsByClassName("sprout");
for(let i = 0; i < sprouts.length; ++i){
    sprouts[i].addEventListener("click", function (){
        change = true;
        let link = prompt("copy and paste your link here!");
        let text;
        let changeIcon;
        if(link != null && link !== ""){
            let invalid = true;
            while(invalid){
                text = prompt("enter your placeholder text here (8 characters max)!");
                if(text.length <= 8){
                    invalid = false;
                }
            }
            changeIcon = "\u{1F338}";
            links.push([link, text, i]);
        }else{
            text = "";
            changeIcon = "\u{1F331}"
        }

        updateLinks(link, text, changeIcon, i);
    });
}
// Helper function to update the link given a link, text, position, and a used/unused icon
function updateLinks(link, text, changeIcon, i){
    let quicklink = document.getElementsByClassName("QL "+(i+1))[0];
    quicklink.setAttribute("href", link)
    quicklink.textContent = text;

    let icon = document.getElementsByClassName("sprout "+(i+1))[0];
    icon.textContent = changeIcon;
}


