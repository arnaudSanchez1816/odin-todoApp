/**
 * Enum for task priorities.
 * @readonly
 * @enum {{value: number, name: string}}
 */
const Priorities = Object.freeze({
    Lowest: {value: -2, name: "Lowest"},
    Low: {value: -1, name: "Low"},
    Medium: {value: 0, name: "Medium"},
    High: {value: 1, name: "High"},
    Highest: {value: 2, name: "Highest"},
    values: function() {
        const valuesArray = [];
        for (const prop in Priorities) {
            if (Object.prototype.hasOwnProperty.call(Priorities, prop)) {                
                const priority = Priorities[prop];
                if(typeof priority === "object") {
                    valuesArray.push(priority);
                }
            }
        }

        return valuesArray;
    },
    exists: function (value) {
        return Object.values(Priorities).includes(value);
    },
    fromValue: function(value) {
        for (const prop in Priorities) {
            if (Object.prototype.hasOwnProperty.call(Priorities, prop)) {
                const priority = Priorities[prop];
                if(priority.value === Number(value)) {
                    return priority;
                }
            }
        }

        throw new Error(`Priority with value ${value} does not exist.`);
    }
});

export default Priorities;