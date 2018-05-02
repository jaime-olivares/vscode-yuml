/**
 * support using like '(a1:test usecase)'
 * and next using (a1) to set quick and ease modify define
 */
var dict = {};

module.exports = function (part) {
    var m = part.match(/^(.+):.+$/);
    if (m) { //save dict
        dict[m[1]] = part;
    } else if (dict[part]) { //load dict
        return dict[part];
    }
    return part;
}
