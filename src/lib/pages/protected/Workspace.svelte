<script>
    import { onMount } from "svelte";
    import Button from "../../components/Button.svelte";
    import Navbar from "../../components/Navbar.svelte";
    import { authState } from "../../stores/auth.svelte";
    import { navigateTo } from "../../stores/page.svelte";

    onMount(()=>{
        //Redundancy check
        //Add real api call for redundancy check?
        if( !authState.isLoggedIn ){
            navigateTo("login");
        }
    });

    function getCourse(){

        console.log("get course");

    }

    async function saveToAccount(){

        console.log("save To Account");
        const res = await fetch("http://localhost/www/tradex/backend/api/app.php", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }            
        });
        console.log( await res.text() )


    }

    
</script>

<section class="w-full h-full text-center bg-neutral-900">

    <Navbar/>
    
    
    <h1 class="bg-neutral-950 py-2 font-semibold">
        Workspace
    </h1>
    
    <section>
        <h1 class="py-2">Course opions</h1>

        <Button onclick={getCourse}>
            Get course
        </Button>
        
        <Button onclick={saveToAccount}>
            Save course
        </Button>

    </section>
    
</section>