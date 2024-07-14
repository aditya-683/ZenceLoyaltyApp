

export const testFiles = (req) => {
    console.log("This is a testing Service");
    const data = {
        "msg":"Testing From Service",
        "status":"200"
    }
    return data;
}