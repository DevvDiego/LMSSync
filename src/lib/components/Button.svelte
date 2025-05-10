<script>

    let { isPrimary = false, ...props } = $props();
</script>


<button {...props}
        class="
        {props.class} 
        {isPrimary ? "bg-blue-800 active:bg-blue-900":"bg-blue-500/60 active:bg-blue-500/60"}
        p-1
        rounded-lg
        
    ">
    
    {@render props.children?.()}

</button>