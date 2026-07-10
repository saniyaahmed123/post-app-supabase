var supabase = window.supabase.createClient(
    'https://lklhickxvjsdjhpdfuwz.supabase.co',
    'sb_publishable_IXGVEByFPxwQuE7iEUArUg_S5STh98Y'
);
let authorEmail = "";
let display_name;
let userId;
window.onload = async function () {

    try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
            console.error("Auth error:", error.message);
        } else if (data && data.user) {
            display_name = data.user.user_metadata.display_name;
            authorEmail = data.user.email || "";
            userId = data.user.id
            console.log(data.user)
            var userIcon = document.getElementById("userIcon");
            if (userIcon) {
                userIcon.innerText = display_name.charAt(0).toUpperCase();
                console.log(display_name)
            }
        }
    } catch (err) {
        console.error("Network or execution error:", err);
    }
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
var editIndex = null;
var selectedFont = "Segoe UI";
var selectedSize = "18px";

var search = document.getElementById('query');

if (search) {
    search.addEventListener('input', async function searchPosts(event) {
        var searchInput = event.target.value;

        if (!searchInput.trim()) {
            loadPosts();
            return;
        }

        try {
            const { data, error } = await supabase
                .from('post app table')
                .select('*')
                .or(`title.ilike.%${searchInput}%,description.ilike.%${searchInput}%,email.ilike.%${searchInput}%,author.ilike.%${searchInput}%`)
                .order('id', { ascending: false });

            if (error) {
                console.error(error);
                return;
            }

            postsContainer.innerHTML = "";
            var listHtml = "";

            if (data && data.length) {
                data.forEach(item => {
                    var itemFont = item.font || "Segoe UI";
                    var itemSize = item.fontSize || "18px";
                    var itemBg = item.image ? `background-image: url(${item.image}); background-size: cover;` : "background-color: transparent;";

                    listHtml += `
            <div class="card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <span class="auth" style="text-transform: lowercase; display: flex; align-items: center; gap: 10px;">
                        <div style="width: 35px; height: 35px; background-color:cornflowerblue; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; text-transform: uppercase;">
                            ${item.author ? item.author.charAt(0) : 'G'}
                        </div>
                        <div class="text-stack" style="display: flex; flex-direction: column; text-align: left;">
                            <span style="font-weight: 500; text-transform: capitalize">${item.author || 'Guest'}</span>
                            <p style="margin: 0; font-size: 0.85rem; color: #6c757d;">${item.email || ''}</p>
                        </div>
                    </span>
                    <div class="ms-auto">
                        <button onclick="deletePost(this ,${item.id})" style="background: none; border: none; cursor: pointer;" class="me-2">
                            <img src="assets/trash-bin.png" style="width: 26px;">
                        </button>
                        <button onclick="editPost(this, ${item.id})" style="background: none; border: none; cursor: pointer;">
                            <img src="assets/pencil.png" style="width: 19px;">
                        </button>
                    </div>
                </div>
                <div class="card-body px-4 py-4" style="${itemBg} min-height: 200px; ">
                    <h3 style="color: ${item.color} !important; font-size: ${itemSize} !important; font-weight: bold; font-family: ${itemFont};">${item.title}</h3>
                    <p style="color: white; font-size: 18px !important;">${item.description}</p>
                </div>
            </div>`;
                });

                postsContainer.innerHTML = listHtml;
            } else {
                postsContainer.innerHTML = `
            <div class="posts-empty-state text-center py-5">
                <img src="nothing.png" alt="No posts found" style="width: 100px; height: auto; margin-bottom: 15px;">
                <p>No posts found.</p>
            </div>`;
            }

        } catch (err) {
            console.error(err);
        }
    });
}


function changeFont(fontPicker) {
    selectedFont = fontPicker.value;
}

function changeSize(sizePicker) {
    selectedSize = sizePicker.value;
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
    if (title) title.style.color = selectedTextColor;
    if (description) description.style.color = selectedTextColor;
}
let imgUrl
var imageFile;
let fileName;
async function post() {
    
    
    
    if (title.value.trim() === "" || description.value.trim() === "") {
        Swal.fire({ title: 'Error!', text: 'Fill all fields', icon: 'error' });
        return;
    }

    imageFile = document.getElementById('customImage').files[0]
    if (imageFile) {
        fileName = `${Date.now()}-${imageFile.name.replace(/\s+/g, '-')}`;
        console.log(fileName)
        const { error: uploadError } = await supabase
        .storage
        .from('postimages')
        .upload(fileName, imageFile, {
            cacheControl: '3600',
            upsert: false
        })
        if (uploadError) {
            alert('upload error')
        }
        const { data: publicUrlData } = supabase
        .storage
        .from('postimages')
        .getPublicUrl(fileName)
            console.log(publicUrlData.publicUrl)
            imgUrl = publicUrlData.publicUrl
        }
        else if(SelectedImgSrc){
            imgUrl = SelectedImgSrc
        }
        var postData = {
            title: title.value,
            description: description.value,
            image: imgUrl,
            color: selectedTextColor,
            author: display_name,
            font: selectedFont,
            fontSize: selectedSize,
            email: authorEmail,
            user_id: userId
    
            
        }



    if (isEditing === true && editIndex !== null) {
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
        let { error } = await supabase
            .from('post app table')
            .insert([postData]);

        if (error) {
            console.error("Insertion Error:", error.message);
            Swal.fire({ title: 'Error!', text: 'Failed to save post.', icon: 'error' });
            return;
        }
    }

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
var item;
async function deletePost(buttonElement, id) {
    // Execute delete statement returning deleted rows
    let { data: postArray, error } = await supabase
        .from('post app table')
        .delete()
        .eq('id', id)
        .select('*');

    // If RLS blocked the operation, postArray will be empty or error will exist
    if (error || !postArray || postArray.length === 0) {
        Swal.fire({
            title: 'Content Protected',
            text: 'This workspace belongs to another creator. You only have permission to delete your own posts.',
            icon: 'info',
            background: '#1e1e24',
            color: '#ffffff',
            confirmButtonColor: '#22d3ee',
            confirmButtonText: 'Got it, thanks!'
        });
        return; // Guard statement stops execution early
    }

    // Only fetch fresh posts if the operation actually succeeded
    loadPosts();
}

function previewPost() {
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
async function editPost(buttonElement, id, user_id) {



    let { data, error } = await supabase
        .from('post app table')
        .select('*')
        .eq('id', id)



    if (error) {
        console.error("Could not fetch post to edit:", error);
        return;
    }

    var item = data[0];

    if (userId !== item.user_id) {
        Swal.fire({
            title: 'Access Denied',
            text: 'This workspace belongs to another creator. You only have permission to edit your own posts.',
            icon: 'warning',
            background: '#1e1e24',
            color: '#ffffff',
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Understood'
        });
        return;
    }
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
    postsContainer.innerHTML = `
    <div class="d-flex mt-5 justify-content-center align-items-center" style="min-height: 200px;">
      <div class="spinner-border text-light" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>`;

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
        var itemBg = item.image ? `background-image: url('${item.image}'); background-size: cover;` : "background-color: transparent;";
        listHtml += `
            <div class="card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <span class="auth" style="text-transform: lowercase; display: flex; align-items: center; gap: 10px;">
                        <div style="width: 35px; height: 35px; background-color:cornflowerblue; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; text-transform: uppercase;">
                            ${item.author ? item.author.charAt(0) : 'G'}
                        </div>
                        <div class="text-stack" style="display: flex; flex-direction: column; text-align: left;">
                            <span style="font-weight: 500; text-transform: capitalize">${item.author || 'Guest'}</span>
                            <p style="margin: 0; font-size: 0.85rem; color: #6c757d;">${item.email || ''}</p>
                        </div>
                    </span>
                    <div class="ms-auto">
                        <button onclick="deletePost(this ,${item.id})" style="background: none; border: none; cursor: pointer;" class="me-2">
                            <img src="assets/trash-bin.png" style="width: 26px;">
                        </button>
                        <button onclick="editPost(this, ${item.id})" style="background: none; border: none; cursor: pointer;">
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