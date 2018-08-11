// Starts a batch server.

module.exports = (redis) => {


    return {
        queue: (sType, sParticulars, iDuration = 0) => {

            redis.rpush(`queuer:transactions:${sType}`, sParticulars);
            // queuer will put a duration block.
            if (iDuration > 0) {
                // set a small value as a marker
                redis.set(`queuer:transaction:${sType}:blocker:${sParticulars}`, 1);
                // set expiration`
                return redis.expire(`queuer:transaction:${sType}:blocker:${sParticulars}`, iDuration);
            }
        },
        /**
         * Gets the oldest transaction ID.
         */
        get: (sType, fCallback) => {
            // Get value from redis
            return redis.lpop(`queuer:transactions:${sType}`, (err, data) => {
                // if the blocker is present in redis, put it in the back.
                return redis.get(`queuer:transaction:${sType}:blocker:${data}`, (err, res) => {
                    if (res === null) {
                        // return the value if it is null
                        return fCallback(null, data);
                    }

                    // queue this again. let redis expire for itself.
                    redis.rpush(`queuer:transactions:${sType}`, data);
                    return fCallback(null, null);
                });
                
            });
        }
    }
}
