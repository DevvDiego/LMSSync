<script>
    import Navbar from "../../components/Navbar.svelte";
    import { authState, logout } from "../../stores/auth.svelte";


    
</script>

<section class="w-full h-full text-center bg-neutral-900">

    <Navbar/>
    
    <header class="text-md">
        <h1>Status:</h1>
    
        <h1>
            email: {authState.user.email}
            password: {authState.user.password}
        </h1>

        <button onclick={()=>logout()} class="bg-green-300">
            logout
        </button>

    </header>



</section>