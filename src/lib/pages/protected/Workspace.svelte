<script>
    import Navbar from "../../components/Navbar.svelte";
    import { authState, logout } from "../../stores/auth.svelte";


    
</script>

<section class="w-full h-full text-center bg-neutral-900">

    <Navbar/>
    
    <header class="text-md">
        <h1>Status:{authState.isLoggedIn}</h1>
    
        
        <!-- ! move logout into a separate page? -->
        <button onclick={()=>logout()} class="bg-green-300">
            logout
        </button>

    </header>



</section>