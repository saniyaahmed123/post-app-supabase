import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase_url = "https://lklhickxvjsdjhpdfuwz.supabase.co"
const publishable_key = "sb_publishable_IXGVEByFPxwQuE7iEUArUg_S5STh98Y"
const supabase = createClient(supabase_url, publishable_key)
let googlebtn = document.getElementById('continueWithGoogle')
googlebtn.addEventListener('click', async() => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: 'http://127.0.0.1:5500/dashboard.html'
        }
    })
})

let InSignUpState = false;

const nameRow = document.getElementById("nameRow");
const fullnameInput = document.getElementById("fullname");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const submitBtn = document.getElementById("submitBtn");
const toggleText = document.getElementById("toggleText");
const toggleBtn = document.getElementById("toggleBtn");

toggleBtn.addEventListener('click', () => {
    InSignUpState = !InSignUpState;
    if (InSignUpState) {
        nameRow.style.display = "block";
        submitBtn.innerText = "Create Account";
        toggleText.innerText = "Already have an account?";
        toggleBtn.innerText = "Log In";
    } else {
        nameRow.style.display = "none";
        submitBtn.innerText = "Log In";
        toggleText.innerText = "Don't have an account?";
        toggleBtn.innerText = "Create Account";
        fullnameInput.value = "";
    }
});

submitBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const fullname = fullnameInput.value.trim();

    if (!email || !password) {
        Swal.fire({ title: 'Error!', text: 'Please fill in all fields.', icon: 'error' });
        return;
    }

    if (InSignUpState) {
        if (!fullname) {
            Swal.fire({ title: 'Error!', text: 'Full name is required to sign up.', icon: 'error' });
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { display_name: fullname }
                }
            });

            if (error) {
                Swal.fire({ title: 'Signup Failed', text: error.message, icon: 'error' });
                return;
            } else {
                Swal.fire({
                    title: 'Success!',
                    text: 'Registered successfully! Please check your email for a confirmation link.',
                    icon: 'success'
                });
                location.href = "dashboard.html";
            }
        } catch (error) {
            console.log(error);
        }

    } else {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                Swal.fire({ title: 'Login Failed', text: error.message, icon: 'error' });
                return;
            } else {
                const userName = data.user.user_metadata.display_name || "User";

                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userName', userName);
                Swal.fire({
                    title: 'Welcome!',
                    text: 'Login successful!',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = "dashboard.html";

                });

            }
        } catch (error) {
            console.log(error);
        }
    }
})
const { data } = supabase.auth.onAuthStateChange((event, session) => {
    console.log(event, session)

    if (event === 'INITIAL_SESSION') {
        if (session === null) {
            alert('create account first !')
        }

    } else if (event === 'SIGNED_IN') {
        // window.location.href = "dashboard.html";

    }
})
