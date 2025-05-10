<script>
    //Pages
    import Login from "./lib/pages/auth/Login.svelte";
    import Workspace from "./lib/pages/protected/Workspace.svelte";
    
    let isLoggedIn = false;

</script>

<main class="w-dvw h-screen text-black dark:text-white dark:bg-gray-950">

<div class="m-auto w-64 h-10/12 border-2 border-amber-900 text-black bg-neutral-900 dark:text-white">
    
    {#if isLoggedIn}
        
        <Workspace/>
    
    {:else if !isLoggedIn}
    
        <Login bind:isLoggedIn />
    
    {:else}

        <h1>Error</h1>

    {/if}

    
</div>

</main>
