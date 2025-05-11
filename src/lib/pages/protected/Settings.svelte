<script>
    import { Fetcher } from "../../classes/Fetcher";
    import Navbar from "../../components/Navbar.svelte";
    import { logout } from "../../stores/auth.svelte";
    import { navigateTo } from "../../stores/page.svelte";

    function fetchLogout(){
        Fetcher.logout(); //api call
        logout(); //local state
        navigateTo("login"); //update current page
    }

</script>

<section class="w-full h-full text-center bg-neutral-900">

    <Navbar/>
    
    <h1 class="py-2 font-semibold text-md bg-neutral-950">Settings page</h1>
    
    <ul class="mt-10">
        <li>
            <button class="w-full p-1 bg-neutral-800" onclick={fetchLogout}>
                Log out
            </button>
        </li>
    </ul>

</section>