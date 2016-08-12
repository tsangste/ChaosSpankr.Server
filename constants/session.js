const STATES = {
    WAITING_FOR_USERS: "WaitingForUsers",
    READY: "Ready",
    ACTIVE: "Active"
}

const VALID_STATES = [STATES.WAITING_FOR_USERS, STATES.READY, STATES.ACTIVE]

module.exports = {STATES, VALID_STATES}
