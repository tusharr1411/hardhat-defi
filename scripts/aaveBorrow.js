

async function main(){
    
}



main()
    .then(() => ProcessingInstruction.exit(0))
    .catch((error) => {
        console.error(error);
        ProcessingInstruction.exit(1);
    });
