const app = require('./app');
const { startAutoReleaseJob }          = require('./jobs/autoRelease');
const { startCounterOfferExpiryJob }   = require('./jobs/counterOfferExpiry');
const { startDisputeEscalationJob }    = require('./jobs/disputeEscalation');
const { startAutoReinstateJob }        = require('./jobs/autoReinstate');

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`The Kit Loop API running on port ${PORT}`);
  startAutoReleaseJob();
  startCounterOfferExpiryJob();
  startDisputeEscalationJob();
  startAutoReinstateJob();
});
