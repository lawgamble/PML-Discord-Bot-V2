function pickupKicker2(gameIsActive) {
  setTimeout(() => {
    if (gameIsActive) {
      let ticker = 0;
      const interval = setInterval(() => {
        console.log("interval");
        console.log(ticker);
        ticker++;
        if (ticker === 5) {
          gameIsActive = false;
        }
        if (!gameIsActive) {
          clearInterval(interval);
        }
      }, 1000);
    }
    console.log("function");
  }, 5000);
}

pickupKicker2(true);
