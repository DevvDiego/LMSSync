<script>
    import Login from "./lib/pages/auth/Login.svelte";
    import Workspace from "./lib/pages/protected/Workspace.svelte";
    import Settings from "./lib/pages/protected/Settings.svelte";
    import { page } from "./lib/stores/page.svelte";
    

    // const pages = [ "login", "workspace", "settings" ]

</script>

<main class="w-dvw h-screen text-black dark:text-white dark:bg-gray-950">

<div class="m-auto w-64 h-10/12 border-2 border-amber-900 text-black bg-neutral-900 dark:text-white">
    
    {#if page.current == "login"}

        <Login/>

    {:else if page.current == "workspace"}

        <Workspace/>

    {:else if page.current == "settings"}

        <Settings/>

    {/if}
    
</div>

</main>
