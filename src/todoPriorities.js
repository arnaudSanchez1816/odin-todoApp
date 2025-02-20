const Priorities = Object.freeze({
    Lowest: Symbol(-2),
    Low: Symbol(-1),
    Normal: Symbol(0),
    High: Symbol(1),
    Highest: Symbol(2),
    exists: function (value) {
        return Object.values(Priorities).includes(value);
    }
});

export default Priorities;