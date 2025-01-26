export default function userProfile( {params} : any) {
    return (

        <div>
            <h1>Profile</h1>
            <hr />
            <p className="text-4xl">profile page {params.id}
                
            </p>
        </div>
        

    )
  }
  