<script>
    import Button from "../../components/Button.svelte";
    import Input from "../../components/Input.svelte";
    import { login } from "../../stores/auth.svelte.js";


    function handleForm(event) {
        event.preventDefault();
        const formData = new FormData(event.target);

        if(formData.get("email") == "diego" && formData.get("password") == "123"){
            login({
                "email":formData.get("email"),
                "password":formData.get("password")
            });
        }
        
        
    }


    let {  } = $props();
</script>


<section>
    <header>
        <h1 class="text-xl text-center py-3">
            Log in to LMS Sync
        </h1>
    </header>

    <form onsubmit={handleForm} class="mt-5 flex flex-col items-center">
        
        <Input text="Email" type="text" name="email"/>        
        <Input text="Password" type="text" name="password"/>
        
        <Button class="w-7/12" type="submit" isPrimary={true}>
            Submit
        </Button>
                
    </form>

</section>