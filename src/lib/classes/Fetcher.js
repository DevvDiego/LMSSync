export class Fetcher{

    static errors = {
        "http":"Request error, code: ",
    }

    /**
     * Checks if the current session is valid
     */
    // static async checkSession(){
    //     let url = "http://localhost:80/www/tradex/backend/api/app.php"
    //     const res = await fetch(url, {
    //         method: "POST",
    //         credentials: "include",
    //         headers: {"Content-Type":"application/json"},
    //     });

    //     if( !res.ok ){
    //         console.log( await res.json() )
            
    //     }

    // }


    /**
     * Checks if the current session is valid
     * @param {FormData} formData 
     */
    static async login(formData){

        //! Add some kind of validation module
        // let email = formData.get("email")  ?? "";
        // let password = formData.get("password") ?? "";

        // if(email == ""){ return null }
        // if(password == ""){ return null }

        let url = "http://localhost/www/tradex/backend/api/auth/login"
        const res = await fetch(url, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "email": formData.get("email"),
                "password": formData.get("password")
            }),
            
        });

        return res
    }


    /**
     * Log out the user  
     */
    static async logout(){
        let url = "http://localhost/www/tradex/backend/api/auth/logout"
        const res = await fetch(url, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            
        });

        return res
    }
}