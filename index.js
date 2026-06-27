
var supabase = window.supabase.createClient(
    'https://lklhickxvjsdjhpdfuwz.supabase.co',
    'sb_publishable_IXGVEByFPxwQuE7iEUArUg_S5STh98Y'
);
window.onload = function () {
    loadPosts();
};
var currentUserName = localStorage.getItem('userName') || "Guest";
var postsContainer = document.getElementById('posts');
var title = document.getElementById('title');
var description = document.getElementById('description');
var SelectedImgSrc = "";
var myStyle = "";
var selectedTextColor = "#000000";
var isEditing = false;
var editIndex = null; // Stores the database row ID during edits
var selectedFont = "Segoe UI";
var selectedSize = "18px";

var userIcon = document.getElementById("userIcon");
if (userIcon) {
    userIcon.innerText = currentUserName.charAt(0).toUpperCase();
}




function changeFont(fontPicker) {
    selectedFont = fontPicker.value;
}


function changeSize(sizePicker) {
    selectedSize = sizePicker.value;
    console.log(selectedSize)
    
}

function applybg(img) {
    SelectedImgSrc = img.getAttribute('src');
    var bgimgs = document.getElementsByClassName('bgimg');
    for (var i = 0; i < bgimgs.length; i++) {
        bgimgs[i].classList.remove('selected');
    }
    img.classList.add('selected');
    myStyle = `background-image: url(${SelectedImgSrc}); background-repeat: no-repeat; background-size: cover; background-position: top;`;
}

function applycolor(element) {
    var colorbox = document.getElementsByClassName('colorbox');
    for (var i = 0; i < colorbox.length; i++) {
        colorbox[i].classList.remove('selected');
    }
    element.classList.add('selected');
    selectedTextColor = element.style.backgroundColor;
    title.style.color = selectedTextColor;
    description.style.color = selectedTextColor;
}

async function post() {
    if (title.value.trim() === "" || description.value.trim() === "") {
        Swal.fire({ title: 'Error!', text: 'Fill all fields', icon: 'error' });
        return;
    }

    var postData = {
        title: title.value,
        description: description.value,
        image: SelectedImgSrc,
        color: selectedTextColor,
        author: currentUserName,
        font: selectedFont,
        fontSize: selectedSize
    };

    // --- NEW CLOUD CODE HAPPENS HERE ---
    if (isEditing === true && editIndex !== null) {
        // Update an existing row matching our database row ID
        let { error } = await supabase
            .from('post app table')
            .update(postData)
            .eq('id', editIndex);

        if (error) {
            console.error("Update Error:", error.message);
            Swal.fire({ title: 'Error!', text: 'Failed to update post.', icon: 'error' });
            return;
        }
        isEditing = false;
        editIndex = null;
    } else {
        // Insert a brand new record into the cloud table
        let {data, error } = await supabase
            .from('post app table')
            .insert([postData])
            .select()
            console.log(data)


        if (error) {
            console.error("Insertion Error:", error.message);
            Swal.fire({ title: 'Error!', text: 'Failed to save post.', icon: 'error' });
            return;
        }
    }

    // Refresh UI and clear out inputs
    loadPosts();
    resetInputs();
}
function resetInputs() {
    title.value = "";
    description.value = "";
    title.style.cssText = "";
    description.style.cssText = "";
    myStyle = "";
    SelectedImgSrc = "";
    selectedTextColor = "#000000";
    selectedFont = "Segoe UI";
    selectedSize = "18px";

    var bgimgs = document.getElementsByClassName('bgimg');
    for (var i = 0; i < bgimgs.length; i++) {
        bgimgs[i].classList.remove('selected');
    }
    var colorbox = document.getElementsByClassName('colorbox');
    for (var i = 0; i < colorbox.length; i++) {
        colorbox[i].classList.remove('selected');
    }
}
async function deletePost(id) {
    let { error } = await supabase
        .from('post app table')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Delete Error:", error.message);
    } else {
        loadPosts();
    }
} function previewPost() {
    if (!title.value.trim() && !description.value.trim()) {
        Swal.fire({ icon: 'error', title: 'Empty!', text: 'Write something to preview!' });
        return;
    }

    Swal.fire({
        title: 'Post Preview',
        html: `
        <div class="card text-start">
            <div class="card-body" style="${myStyle} min-height: 200px; font-family: ${selectedFont};">
                <h3 style="color: ${selectedTextColor}; font-size: ${selectedSize}; font-weight: bold;">${title.value}</h3>
                <p style="color: ${selectedTextColor}; font-size: ${selectedSize};">${description.value}</p>
            </div>
        </div>`,
        confirmButtonText: 'Looks Good!',
        width: '600px'
    });
}
async function editPost(id) {
    let { data: postArray, error } = await supabase
        .from('post app table')
        .select('*')
        .eq('id', id);

    if (error || !postArray || postArray.length === 0) {
        console.error("Could not fetch post to edit:", error);
        return;
    }

    var item = postArray[0];

    title.value = item.title;
    description.value = item.description;
    selectedFont = item.font || "Segoe UI";
    selectedSize = item.fontSize || "18px";
    selectedTextColor = item.color || "#000000";
    SelectedImgSrc = item.image || "";


    if (document.getElementById('fontPicker')) document.getElementById('fontPicker').value = selectedFont;
    if (document.getElementById('sizePicker')) document.getElementById('sizePicker').value = selectedSize;

    myStyle = SelectedImgSrc ? `background-image: url(${SelectedImgSrc}); background-size: cover;` : "";

    editIndex = id;
    isEditing = true;
}
async function loadPosts() {
    if (!postsContainer) return;
    postsContainer.innerHTML = "<h4>Loading posts from cloud...</h4>";

    let { data: allPosts, error } = await supabase
        .from('post app table')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        console.error("Supabase Error:", error.message);
        postsContainer.innerHTML = "<p class='text-danger'>Failed to load posts.</p>";
        return;
    }

    let listHtml = "";
    for (var i = 0; i < allPosts.length; i++) {
        var item = allPosts[i];
        var itemFont = item.font || "Segoe UI";
        var itemSize = item.fontSize || "18px";
        var itemBg = item.image ? `background-image: url(${item.image}); background-size: cover;` : "background-color: transparent;";

        listHtml += `
            <div class="card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <span style="text-transform:capitalize;">Posted by: ${item.author}</span>
                    <div class="ms-auto">
                        <button onclick="deletePost(${item.id})" style="background: none; border: none; cursor: pointer;" class="me-2">
                            <img src="assets/trash-bin.png" style="width: 26px;">
                        </button>
                        <button onclick="editPost(${item.id})" style="background: none; border: none; cursor: pointer;">
                            <img src="assets/pencil.png" style="width: 19px;">
                        </button>
                    </div>
                </div>
                <div class="card-body px-4 py-4" style="${itemBg} min-height: 200px; ">
                    <h3 style="color: ${item.color} !important; font-size: ${itemSize} !important; font-weight: bold; font-family: ${itemFont};">${item.title}</h3>
                    <p style="color: white; font-size: 18px !important;">${item.description}</p>
                </div>
            </div>`;
    }
    postsContainer.innerHTML = listHtml;
}

function logOut() {
    Swal.fire({
        title: 'Logout?',
        text: "You will need to login again to post.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#22d3ee',
        cancelButtonColor: '#ef4444',
        confirmButtonText: 'Yes, Logout'
    }).then(function (result) {
        if (result.isConfirmed) {
            localStorage.removeItem('isLoggedIn');

            window.location.href = 'index.html';
        }
    });
}