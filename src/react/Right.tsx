export async function handleRight(results: HandLandmarkerResult) {
    console.log("right");
    // for now just assume whole note
    // results.handedness[i][0].
    for (let i = 0; i < results.landmarks.length; i++) {
        if (results.handedness[i][0].categoryName == 'Right')
        console.log(results.landmarks[i][8]);
    }

    let x = results.landmarks[i][8].x;
    let y = results.landmarks[i][8].y;
    console.log(x, y);






}

