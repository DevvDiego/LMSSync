<script>

    let { children } = $props();
</script>


<button class=" min-w-4/12
    bg-green-900 hover:bg-green-950 active:bg-black active:text-white    
    rounded px-3 py-1 text-center
    select-none
    ">
    
    {@render children?.()}

</button>