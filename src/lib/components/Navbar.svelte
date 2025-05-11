<script>
    import { navigateTo } from "../stores/page.svelte";


</script>


<nav class="bg-neutral-950">
    <ul class="w-12/12 h-10 px-4 flex justify-between items-center">
        <li>
            <p class="text-xl font-semibold">
                <span class="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-white">
                    LMS
                </span>
                Sync
            </p>
        </li>

        <li>
            <button  onclick={()=>navigateTo("workspace")} class="
                w-6 h-6 
                flex justify-center items-center
                rounded-full border border-green-300
            ">
                <span class="text-xs">W</span>
            </button>
        </li>

        <li>
            <button  onclick={()=>navigateTo("settings")} class="
                w-6 h-6 
                flex justify-center items-center
                rounded-full border border-green-300
            ">
                <span class="text-xs">S</span>
            </button>
        </li>
    </ul>
</nav>