<script>
    import Login from "./lib/pages/auth/Login.svelte";
    import Workspace from "./lib/pages/protected/Workspace.svelte";
    import Settings from "./lib/pages/protected/Settings.svelte";
    import { page } from "./lib/stores/page.svelte";
    import { authState } from "./lib/stores/auth.svelte";

</script>

<main class="
        text-black bg-neutral-900 dark:text-white dark:bg-gray-950
        m-auto w-64 h-[450px] border-2 border-amber-900  
    ">
    
    <!-- always add a backup check for a user being logged in -->
    {#if (page.current == "login") || (!authState.isLoggedIn) }

        <Login/>

    {:else if page.current == "workspace"}

        <Workspace/>

    {:else if page.current == "settings"}

        <Settings/>

    {/if}
    
</main>
