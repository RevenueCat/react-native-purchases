module.exports = {
    dependencies: {
        // This is used for auto linking because `react-native link <dep>` will
        // soon be deprecated 
        // This is essentiallly an auto linking definition for local dependencies
        'react-native-purchases': {
            root: require('path').resolve("../../../")
        },
    },
};