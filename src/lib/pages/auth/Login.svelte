<script>
    import { Fetcher } from "../../classes/Fetcher";
    import Button from "../../components/Button.svelte";
    import Input from "../../components/Input.svelte";
    import { login } from "../../stores/auth.svelte";

    async function handleForm(event){
        event.preventDefault();
        const formData = new FormData(event.target);

        const res = await Fetcher.fetchLogin(formData);
        const json = await res.json();

        if( !res.ok ){

            status = {
                code: res.status,
                response: json.message
            }

            return
        }

        status = {
            code: res.status,
            response: json.message
        }

        
        login();

        return
    }

    let status = $state();

</script>


<section>
    <header>
        <h1 class="text-xl text-center py-3">
            Log in to LMS Sync
        </h1>
    </header>

    <form onsubmit={handleForm} class="mt-5 flex flex-col items-center">
        
        {#if status}
            <div class="
                py-2 px-1 text-center
                {status.code==200 ? "bg-green-600":"bg-red-600"}
            ">
                <p>{status.response}</p>
            </div>            
        {/if}

        <Input text="Username" type="text" name="username"/>        
        <Input text="Password" type="text" name="password"/>
        
        <Button class="w-7/12" type="submit" isPrimary={true}>
            Submit
        </Button>
        
    </form>
</section>