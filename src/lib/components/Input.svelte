<script>


    let { text, type, name} = $props();
</script>


<div class="m-auto mb-5">
            
    <label class="text-xs mb-0.5 block" for={name}>{text}</label>
    <input {type} {name} class="
        p-1 bg-neutral-800 
        focus:outline focus:outline-white/60
        rounded-md border border-neutral-500
    " >

</div>