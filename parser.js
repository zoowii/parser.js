(function () {
    var abstractMethod = function () {
    };
    if (Array.prototype.contains === undefined) {
        Array.prototype.contains = function (item) {
            for (var i = 0; i < this.length; ++i) {
                if (this[i] === item) {
                    return true;
                }
            }
            return false;
        };
    }
    //if (Array.prototype.join === undefined) {
    Array.prototype.join = function (sep) {
        sep = sep || '';
        var result = '';
        for (var i = 0; i < this.length; ++i) {
            if (i > 0) {
                result += sep;
            }
            if (this[i] !== null && this[i] !== undefined) {
                result += this[i].toString();
            }
        }
        return result;
    };
    //}
    if (Array.prototype.clear === undefined) {
        Array.prototype.clear = function () {
            this.length = 0;
        };
    }
    if (Array.prototype.size === undefined) {
        Array.prototype.size = function () {
            return this.length;
        };
    }
    if (Array.prototype.get === undefined) {
        Array.prototype.get = function (index) {
            return this[index];
        };
    }
    if (Array.prototype.remove === undefined) {
        Array.prototype.remove = function (item) {
            var index = this.indexOf(item);
            if (index >= 0) {
                this.removeAt(index);
            }
            return this;
        };
    }
    if (Array.prototype.removeAt === undefined) {
        Array.prototype.removeAt = function (index) {
            if (index >= 0 && index < this.length) {
                var item = this[index];
                this.splice(index, 1);
                return item;
            } else {
                return undefined;
            }
        };
    }
    if (Array.prototype.insertAt === undefined) {
        Array.prototype.insertAt = function (index, item) {
            if (index >= this.length) {
                this.push(item);
            } else {
                this.splice(index, 1, item, this[index]);
            }
        };
    }
    if (Array.prototype.addAll === undefined) {
        Array.prototype.addAll = function (items) {
            for (var i = 0; i < items.length; ++i) {
                this.push(items[i]);
            }
            return this;
        };
    }
    var __extends = function (child, parent) {
        for (var key in parent) {
            if (Object.prototype.hasOwnProperty.call(parent, key)) {
                child[key] = parent[key];
            }
        }
        function Ctor() {
            this.constructor = child;
        }

        Ctor.prototype = parent.prototype;
        child.prototype = new Ctor();
        child.__super__ = parent.prototype;
        return child;
    };

    function State() {
        this.id = ++State._count;
        this.groupIdentity = null;
    }

    State._count = 0;
    State.prototype.toString = function () {
        return '' + this.id;
    };
    exports.State = State;
    function Transform(from, to) {
        this.from = from;
        this.to = to;
    }

    Transform.prototype.toString = function () {
        return this.from.toString() + '->' + this.to.toString();
    };
    Transform.prototype.match = abstractMethod; // match(str, pos)
    Transform.prototype.copyNew = abstractMethod; // copyNew()
    exports.Transform = Transform;
    function MatchGroupResult() {
        this.matchedString = null;
        this.groupIdentity = null;
    }

    MatchGroupResult.prototype.toString = function () {
        return '<' + this.matchedString + ',' + this.groupIdentity + '>';
    };
    exports.MatchGroupResult = MatchGroupResult;

    function MatchResults() {
        this.matchedItems = [];
        this.matched = false;
        this.remainingString = null;
    }

    MatchResults.prototype.count = function () {
        return this.matchedItems.length;
    };
    MatchResults.prototype.toString = function () {
        return '[' + this.matchedItems.join(',') + ']';
    };
    exports.MatchResults = MatchResults;

    function MatchResult() {
        this.matched = false;
        this.lastMatchedString = null;
        this.endState = null;
        this.endgroupIdentity = null;
    }

    MatchResult.prototype.toString = function () {
        return '[MatchResult: Matched=' + this.matched + ', LastMatchedString=' + this.lastMatchedString + ', EndState=' + (this.endState ? this.endState.toString() : '') + ']';
    };
    MatchResult.prototype.equals = function (obj) {
        if (this === obj) {
            return true;
        }
        if (!(obj instanceof MatchResult)) {
            return false;
        }
        return this.matched === obj.matched && this.lastMatchedString === obj.lastMatchedString;
    };
    MatchResult.of = function (matched, str) {
        var result = new MatchResult();
        result.matched = matched;
        result.lastMatchedString = str;
        return result;
    };
    exports.MatchResult = MatchResult;

    function PathState(path, state) {
        this.path = path;
        this.state = state;
    }

    exports.PathState = PathState;

    function Set() {
        this.items = [];
    }

    Set.prototype.get = function (index) {
        return this.items[index];
    };

    Set.prototype.add = function (item) {
        if (!this.contains(item)) {
            this.items.push(item);
        }
        return this;
    };
    Set.prototype.push = function (item) {
        return this.add(item);
    };
    Set.prototype.addAll = function (items) {
        for (var i = 0; i < items.length; ++i) {
            this.add(items[i]);
        }
    };
    Set.prototype.size = function () {
        return this.items.length;
    };
    Set.prototype.count = function () {
        return this.size();
    };
    Set.prototype.entries = function () {
        return this.items;
    };
    Set.prototype.delete = function (item) {
        var notDeleted = [];
        for (var i = 0; i < this.items.length; ++i) {
            if (this.items[i] !== item) {
                notDeleted.push(item);
            }
        }
        this.items = notDeleted;
        return this;
    };
    Set.prototype.contains = function (item) {
        for (var i = 0; i < this.items.length; ++i) {
            if (this.items[i] === item) {
                return true;
            }
        }
        return false;
    };
    exports.Set = Set;
    function RegexLang() {
        this._stringSet = new Set();
    }

    RegexLang.prototype.add = function (str) {
        this._stringSet.add(str);
    };
    RegexLang.prototype.contains = function (str) {
        return this._stringSet.contains(str);
    };
    function NFAMachine() {
        this.states = [];
        this.transforms = [];
        this.acceptableStates = [];
        this.startState = null;
        this.groupIdentity = null;
        this.transformMapping = null;
    }

    NFAMachine.prototype.build = function () {
        this.transformMapping = {};
        for (var i = 0; i < this.transforms.length; ++i) {
            var trans = this.transforms[i];
            if (this.transformMapping[trans.from] === undefined) {
                this.transformMapping[trans.from] = new Set();
            }
            var transes = this.transformMapping[trans.from];
            transes.add(trans);
        }
    };
    NFAMachine.prototype.markGroup = function (group) {
        this.groupIdentity = group;
        for (var i = 0; i < this.states.length; ++i) {
            this.states[i].groupIdentity = group;
        }
    };
    NFAMachine.prototype.addTransform = function (trans) {
        this.transforms.add(trans);
    };
    NFAMachine.prototype.getStatesEmptyConnectedFrom = function (state) {
        var result = new Set();
        var transformsFromState = this.getTransformsFrom(state);
        for (var i = 0; i < transformsFromState.size(); ++i) {
            var trans = transformsFromState.get(i);
            if (trans instanceof EmptyTransform) {
                result.add(trans.to);
                result.addAll(this.getStatesEmptyConnectedFrom(trans.to).entries());
            }
        }
        return result;
    };
    NFAMachine.prototype.getTransformsFrom = function (state) {
        var result = new Set();
        if (this.transformMapping != null) {
            if (this.transformMapping[state] !== undefined) {
                return this.transformMapping[state];
            } else {
                return result;
            }
        }
        for (var i = 0; i < this.transforms.length; ++i) {
            var trans = this.transforms[i];
            if (trans.from === state) {
                result.add(trans);
            }
        }
        return result;
    };
    NFAMachine.prototype.createEmptyCharString = function () {
        return '';
    };
    NFAMachine.prototype.matchAll = function (str) {
        var matchResults = new MatchResults();
        var remaining = str;
        while (remaining.length > 0) {
            var matchResult = this.match(remaining);
            if (!matchResult || matchResult.lastMatchedString === null) {
                remaining = remaining.substr(1);
                continue;
            }
            var newRemaning = remaining.substr(matchResult.lastMatchedString.length);
            if (remaining.length !== newRemaning.length) {
                var matchGroupResult = new MatchGroupResult();
                matchGroupResult.groupIdentity = matchResult.endgroupIdentity;
                matchGroupResult.matchedString = matchResult.lastMatchedString;
                matchResults.matchedItems.push(matchGroupResult)
            }
            if (remaining === newRemaning) {
                break;
            }
            remaining = newRemaning;
            if (matchResult.matched) {
                break;
            }
        }
        matchResults.remainingString = remaining;
        matchResults.matched = remaining.length < 1;
        return matchResults;
    };
    NFAMachine.prototype.match = function (str) {
        var queue = [];
        var initStates = this.getStatesEmptyConnectedFrom(this.startState);
        initStates.add(this.startState);
        var i, item;
        var matchResult;
        for (i = 0; i < initStates.size(); ++i) {
            var pathState = new PathState(this.createEmptyCharString(), initStates.get(i));
            queue.push(pathState);
        }
        var pos = 0;
        var lastMatchedString = null;
        var lastStateGroup = null;
        var lastState = null;
        do {
            for (i = 0; i < queue.length; ++i) {
                item = queue[i];
                if (item.state.groupIdentity != null) {
                    lastStateGroup = item.state.groupIdentity;
                }
                lastState = item.state;
                if (this.acceptableStates.contains(item.state)) {
                    lastMatchedString = item.path;
                }
                if (item.path === str && this.acceptableStates.contains(item.state)) {
                    matchResult = new MatchResult();
                    matchResult.lastMatchedString = lastMatchedString;
                    matchResult.matched = true;
                    matchResult.endState = lastState;
                    matchResult.endgroupIdentity = lastStateGroup;
                    return matchResult;
                }
            }
            if (pos >= str.length) {
                break;
            }
            var newQueue = [];
            for (i = 0; i < queue.length; ++i) {
                item = queue[i];
                var transforms = this.getTransformsFrom(item.state);
                for (var j = 0; j < transforms.size(); ++j) {
                    var trans = transforms.get(j);
                    if (trans.match(str, pos)) {
                        var newStr = item.path + str[pos];
                        newQueue.push(new PathState(newStr, trans.to));
                        var statesEmptyConnectedFrom = this.getStatesEmptyConnectedFrom(trans.to);
                        for (var k = 0; k < statesEmptyConnectedFrom.size(); ++k) {
                            var emptyConnectedItem = statesEmptyConnectedFrom.get(k);
                            if (emptyConnectedItem === trans.to) {
                                continue;
                            }
                            newQueue.push(new PathState(newStr, emptyConnectedItem));
                        }
                    }
                }
            }
            queue = newQueue;
            ++pos;
        } while (pos <= str.length);
        matchResult = new MatchResult();
        matchResult.lastMatchedString = lastMatchedString;
        matchResult.matched = false;
        matchResult.endState = lastState;
        matchResult.endgroupIdentity = lastStateGroup;
        return matchResult;
    };
    NFAMachine.prototype.toString = function () {
        var stateStrs = this.states.join(', ');
        var acStateStrs = this.acceptableStates.join(', ');
        var transStrs = this.transforms.join(', ');
        return "[NFAMachine: States=" + stateStrs + ", Transforms=" + transStrs + ", StartState=" + this.startState.toString() + ", AcceptableStates=" + acStateStrs + "]";
    };

    exports.NFAMachine = NFAMachine;

    /**
     * base transforms
     */
    /**
     * epsilon
     * @param from
     * @param to
     * @constructor
     */
    function EmptyTransform(from, to) {
        Transform.call(this, from, to);
    }

    //EmptyTransform.prototype = new Transform();
    __extends(EmptyTransform, Transform);
    EmptyTransform.prototype.toString = function () {
        return this.from.toString() + '-ε->' + this.to.toString();
    };
    EmptyTransform.prototype.match = function (str, pos) {
        return false;
    };
    EmptyTransform.prototype.copyNew = function () {
        return new EmptyTransform(this.from, this.to);
    };
    exports.EmptyTransform = EmptyTransform;
    function CharTransform(from, to, char) {
        Transform.call(this, from, to);
        this.char = char;
    }

    __extends(CharTransform, Transform);
    CharTransform.prototype.toString = function () {
        return this.from.toString() + '-' + this.char + '->' + this.to.toString();
    };
    CharTransform.prototype.match = function (str, pos) {
        return str[pos] === this.char;
    };
    CharTransform.prototype.copyNew = function () {
        return new CharTransform(this.from, this.to, this.char);
    };
    exports.CharTransform = CharTransform;
    function CharNotInRangeTransform(from, to, outRange) {
        Transform.call(this, from, to);
        this.outRange = outRange;
    }

    __extends(CharNotInRangeTransform, Transform);
    CharNotInRangeTransform.prototype.toString = function () {
        return this.from.toString() + '-not-' + this.outRange + '->' + this.to.toString();
    };
    CharNotInRangeTransform.prototype.match = function (str, pos) {
        return this.outRange.indexOf(str[pos]) < 0;
    };
    CharNotInRangeTransform.prototype.copyNew = function () {
        return new CharNotInRangeTransform(this.from, this.to, this.outRange);
    };
    exports.CharNotInRangeTransform = CharNotInRangeTransform;
    function AnyCharTransform(from, to) {
        Transform.call(this, from, to);
    }

    __extends(AnyCharTransform, Transform);
    AnyCharTransform.prototype.toString = function () {
        return this.from.toString() + '-any->' + this.to.toString();
    };
    AnyCharTransform.prototype.match = function (str, pos) {
        return true;
    };
    AnyCharTransform.prototype.copyNew = function () {
        return new AnyCharTransform(this.from, this.to);
    };
    exports.AnyCharTransform = AnyCharTransform;
    function CharRangeTransform(from, to, startChar, endChar) {
        Transform.call(this, from, to);
        this.startChar = startChar;
        this.endChar = endChar;
    }

    __extends(CharRangeTransform, Transform);
    CharRangeTransform.prototype.toString = function () {
        return this.from.toString() + '-[' + this.startChar + ',' + this.endChar + ']->' + this.to.toString();
    };
    CharRangeTransform.prototype.match = function (str, pos) {
        var c = str[pos].charCodeAt(0);
        var start = this.startChar.charCodeAt(0);
        var end = this.endChar.charCodeAt(0);
        return c >= start && c <= end;
    };
    CharRangeTransform.prototype.copyNew = function () {
        return new CharRangeTransform(this.from, this.to, this.startChar, this.endChar);
    };
    exports.CharRangeTransform = CharRangeTransform;

    function DigitTransform(from, to) {
        CharRangeTransform.call(this, from, to, '0', '9');
    }

    __extends(DigitTransform, CharRangeTransform);
    DigitTransform.prototype.copyNew = function () {
        return new DigitTransform(this.from, this.to);
    };
    exports.DigitTransform = DigitTransform;
    function BigAlphaTransform(from, to) {
        CharRangeTransform.call(this, from, to, 'A', 'Z');
    }

    __extends(BigAlphaTransform, CharRangeTransform);
    BigAlphaTransform.prototype.copyNew = function () {
        return new BigAlphaTransform(this.from, this.to);
    };
    exports.BigAlphaTransform = BigAlphaTransform;

    function LittleAlphaTransform(from, to) {
        CharRangeTransform.call(this, from, to, 'a', 'z');
    }

    __extends(LittleAlphaTransform, CharRangeTransform);
    LittleAlphaTransform.prototype.copyNew = function () {
        return new LittleAlphaTransform(this.from, this.to);
    };
    exports.LittleAlphaTransform = LittleAlphaTransform;
    // TODO: 开头,结尾,前后向断言等的transform

    function RegexExpr() {
        NFAMachine.call(this);
    }

    __extends(RegexExpr, NFAMachine);
    RegexExpr.prototype.createInstance = function () {
        return new RegexExpr();
    };
    RegexExpr.prototype.createEmptyCharString = function () {
        return '';
    };
    RegexExpr.prototype.getOrcreateInStateMapping = function (mapping, state) {
        if (mapping[state] !== undefined) {
            return mapping[state];
        }
        var newState = new State();
        newState.groupIdentity = state.groupIdentity;
        mapping[state] = newState;
        return newState;
    };
    RegexExpr.prototype.copyNew = function () {
        var expr = this.createInstance();
        var stateMapping = {};
        expr.startState = this.getOrcreateInStateMapping(stateMapping, this.startState);
        var i;
        expr.states.clear();
        for (i = 0; i < this.states.length; ++i) {
            expr.states.push(this.getOrcreateInStateMapping(stateMapping, this.states[i]));
        }
        expr.acceptableStates.clear();
        for (i = 0; i < this.acceptableStates.length; ++i) {
            expr.acceptableStates.push(this.getOrcreateInStateMapping(stateMapping, this.acceptableStates[i]));
        }
        expr.transforms.clear();
        for (i = 0; i < this.transforms.length; ++i) {
            var trans = this.transforms[i];
            var from = this.getOrcreateInStateMapping(stateMapping, trans.from);
            var to = this.getOrcreateInStateMapping(stateMapping, trans.to);
            var newTrans = trans.copyNew();
            newTrans.from = from;
            newTrans.to = to;
            expr.transforms.push(newTrans);
        }
        return expr;
    };
    RegexExpr.prototype.addStates = function (otherRegexExpr) {
        for (var i = 0; i < otherRegexExpr.states.length; ++i) {
            this.states.push(otherRegexExpr.states[i]);
        }
    };
    RegexExpr.prototype.addTransforms = function (otherRegexExpr) {
        for (var i = 0; i < otherRegexExpr.transforms.length; ++i) {
            this.transforms.push(otherRegexExpr.transforms[i]);
        }
    };
    /**
     * ab
     * @param other
     */
    RegexExpr.prototype.concat = function (other) {
        var expr = new RegexExpr();
        var startState = new State();
        var endState = new State();
        startState.groupIdentity = this.startState.groupIdentity;
        endState.groupIdentity = this.startState.groupIdentity;
        var copiedThis = this.copyNew();
        var copiedOther = other.copyNew();
        expr.startState = startState;
        expr.acceptableStates.push(endState);
        expr.states.push(startState);
        expr.states.push(endState);
        expr.addStates(copiedThis);
        expr.addStates(copiedOther);
        expr.addTransforms(copiedThis);
        expr.addTransforms(copiedOther);
        var startToAStart = new EmptyTransform(startState, copiedThis.startState);
        expr.transforms.push(startToAStart);
        copiedThis.acceptableStates.forEach(function (state) {
            expr.transforms.push(new EmptyTransform(state, copiedOther.startState));
        });
        copiedOther.acceptableStates.forEach(function (state) {
            expr.transforms.push(new EmptyTransform(state, endState));
        });
        return expr;
    };
    RegexExpr.unionAll = function () {
        var exprs = arguments;
        if (exprs.length < 1) {
            throw new Error("need at least one expr to union");
        }
        var pos = exprs.length - 1;
        var result = exprs[pos];
        while (pos > 0) {
            pos -= 1;
            result = exprs[pos].union(result);
        }
        return result;
    };
    /**
     * a | b
     * @param other
     */
    RegexExpr.prototype.union = function (other) {
        var expr = new RegexExpr();
        var startState = new State();
        var endState = new State();
        var copiedThis = this.copyNew();
        var copiedOther = other.copyNew();
        expr.startState = startState;
        expr.acceptableStates.push(endState);
        expr.states.push(startState);
        expr.states.push(endState);
        expr.addStates(copiedThis);
        expr.addStates(copiedOther);
        expr.addTransforms(copiedThis);
        expr.addTransforms(copiedOther);
        var startToAStart = new EmptyTransform(startState, copiedThis.startState);
        var startToBStart = new EmptyTransform(startState, copiedOther.startState);
        expr.transforms.push(startToAStart);
        expr.transforms.push(startToBStart);
        copiedThis.acceptableStates.forEach(function (state) {
            expr.transforms.push(new EmptyTransform(state, endState));
        });
        copiedOther.acceptableStates.forEach(function (state) {
            expr.transforms.push(new EmptyTransform(state, endState));
        });
        return expr;
    };
    /**
     * repeat at least zero times
     */
    RegexExpr.prototype.closure = function () {
        var expr = new RegexExpr();
        var startState = new State();
        var endState = new State();
        startState.groupIdentity = this.startState.groupIdentity;
        endState.groupIdentity = this.startState.groupIdentity;
        expr.startState = startState;
        expr.acceptableStates.push(endState);
        expr.states.push(startState);
        expr.states.push(endState);
        expr.addStates(this);
        expr.addTransforms(this);
        var startToOldStart = new EmptyTransform(startState, this.startState);
        expr.transforms.push(startToOldStart);
        var startToEnd = new EmptyTransform(startState, endState);
        expr.transforms.push(startToEnd);
        var _this = this;
        this.acceptableStates.forEach(function (state) {
            var oldEndToEnd = new EmptyTransform(state, endState);
            expr.transforms.push(oldEndToEnd);
            var oldEndToOldStart = new EmptyTransform(state, _this.startState);
            expr.transforms.push(oldEndToOldStart);
        });
        return expr;
    };
    /**
     * repeat at least one times
     */
    RegexExpr.prototype.plus = function () {
        return this.copyNew().concat(this.closure());
    };
    /**
     * repeat at least $count times
     */
    RegexExpr.prototype.repeatTimes = function (count) {
        var result = new EmptyExpr();
        for (var i = 0; i < count; ++i) {
            result = result.concat(this.copyNew());
        }
        return result;
    };
    /**
     * repeat at least start times
     * @param min
     * @returns RegexExpr
     */
    RegexExpr.prototype.repeatAtLeast = function (min) {
        return this.repeatTimes(min).concat(this.closure());
    };
    /**
     * repeat [min, max] times
     */
    RegexExpr.prototype.repeatRangeTimes = function (min, max) {
        if (max < min) {
            return new EmptyExpr();
        }
        if (max == min) {
            return this.repeatTimes(min);
        }
        var result = this.repeatTimes(min);
        for (var i = 0; i < max - min; ++i) {
            result = result.concat(this.optional());
        }
        return result;
    };

    RegexExpr.prototype.repeat = function (min, max) {
        if (max === undefined) {
            return this.repeatTimes(min);
        }
        return this.repeatRangeTimes(min, max);
    };
    /**
     * the regex expr is optional
     */
    RegexExpr.prototype.optional = function () {
        return this.copyNew().union(new EmptyExpr());
    };
    exports.RegexExpr = RegexExpr;
    // base RegexExpr sub implementations
    function CharExpr(char) {
        RegexExpr.call(this);
        var startState = new State();
        var endState = new State();
        var charTrans = new CharTransform(startState, endState, char);
        this.startState = startState;
        this.states.push(startState);
        this.states.push(endState);
        this.acceptableStates.push(endState);
        this.transforms.push(charTrans);
    }

    __extends(CharExpr, RegexExpr);
    CharExpr.prototype.createInstance = function () {
        return new CharExpr('\0');
    };
    CharExpr.createUnionFromChars = function (str) {
        if (str == null || str.length < 1) {
            return new EmptyExpr();
        }
        var result = null;
        for (var i = 0; i < str.length; ++i) {
            if (i == 0) {
                result = new CharExpr(str[i]);
            }
            else {
                result = result.union(new CharExpr(str[i]));
            }
        }
        return result;
    };
    exports.CharExpr = CharExpr;
    function CharNotInRangeExpr(outRange) {
        RegexExpr.call(this);
        this.outRange = outRange;
        var startState = new State();
        var endState = new State();
        var charTrans = new CharNotInRangeTransform(startState, endState, outRange);
        this.startState = startState;
        this.states.push(startState);
        this.states.push(endState);
        this.acceptableStates.push(endState);
        this.transforms.push(charTrans);
    }

    __extends(CharNotInRangeExpr, RegexExpr);
    CharNotInRangeExpr.prototype.createInstance = function () {
        return new CharNotInRangeExpr('');
    };
    exports.CharNotInRangeExpr = CharNotInRangeExpr;
    function DigitExpr() {
        RegexExpr.call(this);
        var startState = new State();
        var endState = new State();
        var digitTrans = new DigitTransform(startState, endState);
        this.startState = startState;
        this.states.push(startState);
        this.states.push(endState);
        this.acceptableStates.push(endState);
        this.transforms.push(digitTrans);
    }

    __extends(DigitExpr, RegexExpr);
    DigitExpr.prototype.createInstance = function () {
        return new DigitExpr();
    };
    exports.DigitExpr = DigitExpr;
    function AnyCharExpr() {
        RegexExpr.call(this);
        var startState = new State();
        var endState = new State();
        var digitTrans = new AnyCharTransform(startState, endState);
        this.startState = startState;
        this.states.push(startState);
        this.states.push(endState);
        this.acceptableStates.push(endState);
        this.transforms.push(digitTrans);
    }

    __extends(AnyCharExpr, RegexExpr);
    AnyCharExpr.prototype.createInstance = function () {
        return new AnyCharExpr();
    };
    exports.AnyCharExpr = AnyCharExpr;
    function CharRangeExpr(start, end) {
        RegexExpr.call(this);
        var startState = new State();
        var endState = new State();
        var trans = new CharRangeTransform(startState, endState, start, end);
        this.startState = startState;
        this.states.push(startState);
        this.states.push(endState);
        this.acceptableStates.push(endState);
        this.transforms.push(trans);
    }

    __extends(CharRangeExpr, RegexExpr);
    CharRangeExpr.prototype.createInstance = function () {
        return new CharRangeExpr('\0', '\0');
    };
    exports.CharRangeExpr = CharRangeExpr;
    function AlphaExpr() {
        RegexExpr.call(this);
        var startState = new State();
        var endState = new State();
        var trans1 = new BigAlphaTransform(startState, endState);
        var trans2 = new LittleAlphaTransform(startState, endState);
        this.startState = startState;
        this.states.push(startState);
        this.states.push(endState);
        this.acceptableStates.push(endState);
        this.transforms.push(trans1);
        this.transforms.push(trans2);
    }

    __extends(AlphaExpr, RegexExpr);
    AlphaExpr.prototype.createInstance = function () {
        return new AlphaExpr();
    };
    exports.AlphaExpr = AlphaExpr;
    function BigAlphaExpr() {
        RegexExpr.call(this);
        var startState = new State();
        var endState = new State();
        var trans = new BigAlphaTransform(startState, endState);
        this.startState = startState;
        this.states.push(startState);
        this.states.push(endState);
        this.acceptableStates.push(endState);
        this.transforms.push(trans);
    }

    __extends(BigAlphaExpr, RegexExpr);
    BigAlphaExpr.prototype.createInstance = function () {
        return new BigAlphaExpr();
    };
    exports.BigAlphaExpr = BigAlphaExpr;
    function LittleAlphaExpr() {
        RegexExpr.call(this);
        var startState = new State();
        var endState = new State();
        var trans = new LittleAlphaTransform(startState, endState);
        this.startState = startState;
        this.states.push(startState);
        this.states.push(endState);
        this.acceptableStates.push(endState);
        this.transforms.push(trans);
    }

    __extends(LittleAlphaExpr, RegexExpr);
    LittleAlphaExpr.prototype.createInstance = function () {
        return new LittleAlphaExpr();
    };
    exports.LittleAlphaExpr = LittleAlphaExpr;
    function EmptyExpr() {
        RegexExpr.call(this);
        var startState = new State();
        var endState = new State();
        var emptyTrans = new EmptyTransform(startState, endState);
        this.startState = startState;
        this.states.push(startState);
        this.states.push(endState);
        this.acceptableStates.push(endState);
        this.transforms.push(emptyTrans);
    }

    __extends(EmptyExpr, RegexExpr);
    EmptyExpr.prototype.createInstance = function () {
        return new EmptyExpr();
    };
    exports.EmptyExpr = EmptyExpr;

    // parser engine
    function Var(name) {
        this.name = name;
        this.isMiddleVar = false;
        this.isNotLeftVar = false;
        this.originVar = null;
        this.minCount = 1;
    }

    Var.prototype.toString = function () {
        return this.name;
    };
    exports.Var = Var;
    function FinalVar(name) {
        this.name = name;
        this.isMiddleVar = false;
        this.isNotLeftVar = false;
        this.originVar = null;
        this.minCount = 1;
    }

    FinalVar.prototype.toString = function () {
        return this.name;
    };
    exports.FinalVar = FinalVar;
    function EmptyVar() {
        FinalVar.call(this, '');
        this.minCount = 0;
    }

    __extends(EmptyVar, FinalVar);
    EmptyVar.instance = new EmptyVar();
    exports.EmptyVar = EmptyVar;

    function Token(text, tokenType) {
        this.text = text;
        this.tokenType = tokenType;
    }

    Token.prototype.toString = function () {
        return this.text;
    };
    Token.empty = new Token('', EmptyVar.instance);
    exports.Token = Token;
    function CList(head, tail) {
        this.head = head;
        this.tail = tail;
        this._constructor = CList;
    }

    CList.prototype.lastNode = function () {
        var result = this;
        while (result.tail != null) {
            result = result.tail;
        }
        return result;
    };
    CList.prototype.hasNext = function () {
        return this.tail !== null && this.tail !== undefined;
    };
    CList.prototype.cons = function (item) {
        return new this._constructor(item, this);
    };
    CList.prototype.append = function (item) {
        var result = this.cloneNew();
        result.lastNode().tail = new this._constructor(item, null);
        return result;
    };
    CList.prototype.push = CList.prototype.append;
    CList.prototype.cloneNew = function () {
        return new this._constructor(this.head, this.tail != null ? this.tail.cloneNew() : null);
    };
    CList.prototype.count = function () {
        var cur = this;
        var sum = 1;
        while (cur.tail != null) {
            sum += 1;
            cur = cur.tail;
        }
        return sum;
    };
    CList.prototype.size = CList.prototype.count;
    CList.prototype.get = function (index) {
        var count = this.size();
        if (index < 0 || index >= count) {
            throw new RangeError();
        }
        var cur = this;
        var pos = 0;
        while (pos < index) {
            pos += 1;
            cur = cur.tail;
        }
        return cur.head;
    };
    CList.prototype.forEach = function (action) {
        var cur = this;
        do
        {
            action(cur.head);
            cur = cur.tail;
        } while (cur != null);
    };
    CList.prototype.toString = function () {
        var builder = '';
        this.forEach(function (item) {
            builder += item.toString();
        });
        return builder;
    };
    exports.CList = CList;
    function TokenList(head, tail) {
        CList.call(this, head, tail);
        this._constructor = TokenList;
    }

    __extends(TokenList, CList);
    TokenList.prototype.addTokenToHead = function (item) {
        return this.cons(item);
    };
    TokenList.createFromList = function (tokens) {
        if (tokens.length < 1) {
            return null;
        }
        var pos = tokens.length - 1;
        var result = new TokenList(tokens[pos], null);
        while (pos > 0) {
            pos -= 1;
            result = result.addTokenToHead(tokens[pos]);
        }
        return result;
    };
    TokenList.create = function () {
        if (arguments.length > 0 && Array.isArray(arguments[0])) {
            return TokenList.createFromList(arguments[0]);
        }
        var tokens = arguments;
        if (tokens.length < 1) {
            return null;
        }
        var pos = tokens.length - 1;
        var result = new TokenList(tokens[pos], null);
        while (pos > 0) {
            pos -= 1;
            result = result.addTokenToHead(tokens[pos]);
        }
        return result;
    };
    exports.TokenList = TokenList;

    function MatchRule() {
        this.items = [];
    }

    exports.MatchRule = MatchRule;
    function RuleItem(items, extraInfo) {
        this.items = items || [];
        this.extraInfo = extraInfo || null;
    }

    RuleItem.prototype.subitems = function (start, end) {
        if (end === undefined) {
            end = 0;
        }
        if (start === undefined) {
            start = 0;
        }
        if (end == 0) {
            end = this.items.size();
        }
        var result = [];
        for (var i = start; i < end; ++i) {
            if (i >= 0 && i < this.items.size()) {
                result.push(this.items[i]);
            }
        }
        return result;
    };
    RuleItem.prototype.toString = function () {
        var builder = '';
        for (var i = 0; i < this.items.size(); ++i) {
            if (i > 0) {
                builder += " ";
            }
            builder += this.items[i].toString();
        }
        return builder.toString();
    };
    RuleItem.create = function () {
        var items = arguments;
        var result = new RuleItem();
        for (var i = 0; i < items.length; ++i) {
            result.items.push(items[i]);
        }
        return result;
    };
    RuleItem.prototype.extra = function (info) {
        this.extraInfo = info;
        return this;
    };
    exports.RuleItem = RuleItem;
    function Rule(destVar, items) {
        this.items = items || [];
        this.destVar = destVar || null;
    }

    /**
     * 分离出所有子产生式中的直接左递归和非直接左递归
     *
     * @return object pair-left是直接左递归的项,pair-right是非直接左递归的项
     */
    Rule.prototype.splitByLeftRecursive = function () {
        var pair = {};
        pair.left = [];
        pair.right = [];
        var destVar = this.destVar;
        this.items.forEach(function (item) {
            if (item.items.size() > 0 && item.items.get(0) === destVar) {
                pair.left.push(item);
            } else {
                pair.right.push(item);
            }
        });
        return pair;
    };
    Rule.prototype.toString = function () {
        return this.destVar.toString() + ' -> ' + this.items.join(' | ');
    };
    exports.Rule = Rule;

    function SyntaxTreeNode(nodeVar, valueToken) {
        if (valueToken === undefined) {
            valueToken = null;
        }
        if (nodeVar === undefined) {
            nodeVar = null;
        }
        this.items = [];
        this.nodeVar = nodeVar;
        this.valueToken = valueToken;
        this.isBound = false;
        this.parent = null; // 指向父节点，只在要用到时被设置
        this.extraInfo = null;
    }

    SyntaxTreeNode.prototype.markSubParents = function () {
        if (this.items != null) {
            var _this = this;
            this.items.forEach(function (item) {
                item.parent = _this;
                item.markSubParents();
            });
        }
    };
    SyntaxTreeNode.prototype.cloneNew = function () {
        var node = new SyntaxTreeNode(this.nodeVar, this.valueToken);
        this.items.forEach(function (item) {
            node.items.push(item.cloneNew());
        });
        node.isBound = this.isBound;
        return node;
    };
    SyntaxTreeNode.prototype.toString = function () {
        var builder = '';
        if (this.nodeVar instanceof FinalVar && this.isBound) {
            return this.valueToken.toString();
        }
        var showParent = this.items.size() < 1;
        if (showParent) {
            builder += this.nodeVar.toString();
        }
        if (this.valueToken) {
            builder += this.valueToken.toString();
        }
        if (showParent) {
            if (this.items.size() > 0) {
                builder += "[";
            }
        }
        builder += this.items.join(' ');
        if (showParent) {
            if (this.items.size() > 0) {
                builder += "]";
            }
        }
        return builder;
    };
    SyntaxTreeNode.prototype.minCount = function () {
        if (this.nodeVar instanceof FinalVar) {
            return this.nodeVar.minCount;
        }
        else {
            var minCount = 0;
            this.items.forEach(function (item) {
                minCount += item.minCount();
            });
            return minCount;
        }
    };
    exports.SyntaxTreeNode = SyntaxTreeNode;
    function SyntaxTree() {
        this.rootNode = null;
    }

    SyntaxTree.prototype.leftUnBoundVarOfNode = function (node) {
        if (!node.isBound) {
            return node;
        }
        for (var i = 0; i < node.items.size(); ++i) {
            var item = node.items.get(i);
            var res = this.leftUnBoundVarOfNode(item);
            if (res != null) {
                return res;
            }
        }
        return null;
    };
    SyntaxTree.prototype.firstMiddleVarNodeUnder = function (node) {
        if (node.nodeVar.isMiddleVar) {
            return node;
        }
        for (var i = 0; i < node.items.size(); ++i) {
            var item = node.items.get(i);
            var res = this.firstMiddleVarNodeUnder(item);
            if (res) {
                return res;
            }
        }
        return null;
    };
    /**
     * 找到第一个父节点只包含一个子节点，且父子节点的nodeVar是同一个Var，返回这种情况下的子节点
     */
    SyntaxTree.prototype.firstRepeatNodeUnder = function (node) {
        if (node.items.size() === 1 && node.nodeVar === node.items[0].nodeVar) {
            return node.items[0];
        }
        for (var i = 0; i < node.items.size(); ++i) {
            var item = node.items.get(i);
            var res = this.firstRepeatNodeUnder(item);
            if (res != null) {
                return res;
            }
        }
        return null;
    };
    SyntaxTree.prototype.firstRepeatNode = function () {
        return this.firstRepeatNodeUnder(this.rootNode);
    };
    SyntaxTree.prototype.firstMiddleVarNode = function () {
        return this.firstMiddleVarNodeUnder(this.rootNode);
    };
    SyntaxTree.prototype.leftUnBoundVar = function () {
        return this.leftUnBoundVarOfNode(this.rootNode);
    };
    SyntaxTree.prototype.isFinished = function () {
        return this.leftUnBoundVar() === null;
    };
    SyntaxTree.prototype.cloneNew = function () {
        var other = new SyntaxTree();
        other.rootNode = this.rootNode.cloneNew();
        return other;
    };
    SyntaxTree.prototype.toString = function () {
        return this.rootNode.toString();
    };
    SyntaxTree.prototype.minCount = function () {
        return this.rootNode.minCount();
    };
    exports.SyntaxTree = SyntaxTree;
    function MatchOption(tree, remainingTokens) {
        this.tree = tree;
        this.remainingTokens = remainingTokens;
    }

    MatchOption.prototype.remainingTokensCount = function () {
        return this.remainingTokens ? this.remainingTokens.size() : 0;
    };
    MatchOption.prototype.isFinished = function () {
        return this.tree.isFinished() && this.remainingTokensCount() < 1;
    };
    MatchOption.prototype.isEnd = function () {
        return this.remainingTokensCount() < 1;
    };
    MatchOption.prototype.toString = function () {
        return this.tree.toString() + (this.remainingTokens ? this.remainingTokens.toString() : "");
    };
    exports.MatchOption = MatchOption;
    function Parser(startVar, rules, vars) {
        this.rules = rules || [];
        this.vars = vars || [];
        this.startVar = startVar || null;
        this.originRules = null;
        this.destRuleMapping = null;
        this._initialized = false;
    }

    /**
     * 按DestVar对rules进行分组
     */
    Parser.prototype.groupRulesByDestVar = function () {
        var destVars = new Set();
        this.rules.forEach(function (rule) {
            destVars.push(rule.destVar);
        });
        var groupedRules = [];
        for (var i = 0; i < destVars.size(); ++i) {
            var destVar = destVars.get(i);
            var rules = this.findRulesOfDestVar(destVar);
            if (rules != null) {
                var groupRule = new Rule();
                groupRule.destVar = destVar;
                rules.forEach(function (rule) {
                    rule.items.forEach(function (item) {
                        groupRule.items.push(item);
                    });
                });
                groupedRules.push(groupRule);
            }
        }
        this.rules = groupedRules;
    };
    Parser.prototype.buildDestRuleMapping = function () {
        this.destRuleMapping = {};
        for (var i = 0; i < this.rules.size(); ++i) {
            var rule = this.rules[i];
            this.destRuleMapping[rule.destVar] = rule;
        }
    };
    Parser._incNo = 1;
    Parser.prototype.nextIncNo = function () {
        return Parser._incNo++;
    };
    /**
     * 带有消除直接左递归和间接左递归（间接左递归可以转成直接左递归再消除）
     * 直接左递归的消除方法：
     * 按DestVar对所有Rule产生式进行分组，
     * 然后对于每一组，根据第一个子产生式的第一项是否是DestVar本身来判断是否是直接左递归
     * 是直接左递归的那一组，都是以DestVar开头，所以可以组合成一个DestVar'的新Var，内容是上述直接左递归的子产生式的除了第一项外的内容，然后DestVar=>DestVar + DestVar'
     * 另外非直接左递归的那一组可以组成一个新的DestVar''的新Var，所以DestVar => DestVar''
     * 然后DestVar => DestVar + DestVar' | DestVar''
     * 然后就可以改写成 DestVar => DestVar'' + P' 和P' => DestVar' + P' | ε
     * 这样直接左递归就消除了
     *
     * TODO: 暂时没考虑间接左递归
     * TODO: 移除无用规则
     * TODO: 对于A=>B唯一的情况,可以直接A=> B的所有子产生式
     * TODO: 其他优化
     * @returns {Parser}
     */
    Parser.prototype.build = function () {
        if (this._initialized) {
            return this;
        }
        this._initialized = true;
        this.originRules = this.rules;
        this.groupRulesByDestVar();
        var finalRules = [];
        for (var i = 0; i < this.rules.size(); ++i) {
            var rule = this.rules[i];
            var splitedByLeftRecPair = rule.splitByLeftRecursive();
            var leftRecitems = splitedByLeftRecPair.left;
            var notLeftRecitems = splitedByLeftRecPair.right;
            if (leftRecitems.size() > 0 && notLeftRecitems.size() < 1) {
                throw new Error("the parse rule can't be used " + rule);
            }
            if (leftRecitems.size() < 1) {
                finalRules.push(rule);
                continue;
            }
            var leftRecItemVar; // 以上算法描述中的DestVar => DestVar + DestVar' 这个子产生式中的DestVar'
            var notLeftRecItemVar; // 以上算法描述中的DestVar => DestVar'' 这个子产生式中的DestVar''
            // 产生一个新Var代表上述直接左递归子产生式中的去掉头部的部分
            var destVarLeftRecReplaceVar = new Var(rule.destVar.name + "@@left-" + this.nextIncNo());
            destVarLeftRecReplaceVar.isMiddleVar = true;
            destVarLeftRecReplaceVar.originVar = rule.destVar;
            var destVarLeftRecReplaceVarRule = new Rule();
            destVarLeftRecReplaceVarRule.destVar = destVarLeftRecReplaceVar;
            for (var j = 0; j < leftRecitems.size(); ++j) {
                var item = leftRecitems.get(j);
                if (item.items.size() > 0) {
                    var subItem = new RuleItem();
                    subItem.items = item.subitems(1);
                    subItem.extraInfo = item.extraInfo;
                    destVarLeftRecReplaceVarRule.items.push(subItem);
                }
            }
            finalRules.push(destVarLeftRecReplaceVarRule);
            this.vars.push(destVarLeftRecReplaceVar);
            leftRecItemVar = destVarLeftRecReplaceVar;
            // 产生一个新Var代表上述非直接左递归子产生式中的全部
            var destVarNotLeftRecReplaceVar = new Var(rule.destVar.name + "@@not-left-" + this.nextIncNo());
            destVarNotLeftRecReplaceVar.isMiddleVar = true;
            destVarNotLeftRecReplaceVar.isNotLeftVar = true;
            destVarNotLeftRecReplaceVar.originVar = rule.destVar;
            var destVarNotLeftRecReplaceVarRule = new Rule();
            destVarNotLeftRecReplaceVarRule.destVar = destVarNotLeftRecReplaceVar;
            destVarNotLeftRecReplaceVarRule.items = notLeftRecitems;
            finalRules.push(destVarNotLeftRecReplaceVarRule);
            this.vars.push(destVarNotLeftRecReplaceVar);
            notLeftRecItemVar = destVarNotLeftRecReplaceVar;
            var pVar = new Var(rule.destVar.name + "@@p-" + this.nextIncNo()); // 上面算法描述中的P'
            pVar.isMiddleVar = true;
            pVar.originVar = rule.destVar;
            this.vars.push(pVar);
            var pVarRule = new Rule();
            pVarRule.destVar = pVar;
            var pVarRuleItem1 = new RuleItem();
            pVarRuleItem1.items = [leftRecItemVar, pVar];
            var pVarRuleItem2 = new RuleItem();
            var pVarRuleItem2EmptyVar = new EmptyVar();
            pVarRuleItem2EmptyVar.isMiddleVar = true;
            pVarRuleItem2EmptyVar.originVar = rule.destVar;
            pVarRuleItem2.items = [pVarRuleItem2EmptyVar];
            pVarRule.items.push(pVarRuleItem1);
            pVarRule.items.push(pVarRuleItem2);
            finalRules.push(pVarRule);
            var destVarRule = new Rule();
            destVarRule.destVar = rule.destVar;
            var destVarRuleItem = new RuleItem();
            destVarRuleItem.items = [notLeftRecItemVar, pVar];
            destVarRule.items.push(destVarRuleItem);
            finalRules.push(destVarRule);
        }
        this.rules = finalRules;
        this.buildDestRuleMapping();
        return this;
    };
    Parser.prototype.findRulesOfDestVar = function (destVar, rules) {
        rules = rules || null;
        var usingRules = rules != null ? rules : this.rules;
        if (!this.destRuleMapping || rules != null) {
            var result = [];
            for (var i = 0; i < usingRules.size(); ++i) {
                var rule = usingRules.get(i);
                if (rule.destVar === destVar) {
                    result.push(rule);
                }
            }
            return result;
        }
        else {
            if (destVar instanceof Var && this.destRuleMapping[destVar]) {
                return [this.destRuleMapping[destVar]];
            }
            else {
                return [];
            }
        }
    };
    Parser.prototype.parse = function (tokens) {
        this.build();
        var tree = new SyntaxTree();
        tree.rootNode = new SyntaxTreeNode(this.startVar);
        var allOptions = [];
        allOptions.push(new MatchOption(tree, tokens));
        var tokensCount = tokens.size();
        while (allOptions.size() > 0) {
            var option = allOptions[0];
            allOptions.shift();
            if (option.isFinished()) {
                var finalTree = option.tree;
                finalTree = this.getSyntaxTreeFromOriginRules(finalTree);
                this.markextraInfoInSyntaxTreeNode(finalTree.rootNode, this.originRules);
                return finalTree;
            }
            if (option.tree.minCount() > tokensCount) {
                continue;
            }
            var options = this.tryMatchNext(option.tree, option.remainingTokens);
            if (options != null) {
                allOptions.addAll(options);
            }
        }
        return null;
    };
    /**
     * 生成直接满足最初的文法规则的抽象语法树，方便下一步的使用
     * 从抽象语法树的最左下角开始寻找（应该不一定要从左下角开始，但是选择这样统一逻辑），不断把中间过程的Var（只是left-var和p-var）的所有items直接替换掉原来此Var的位置,如果此中间Var是not-left-var，则不这样做，而是把此not-left-var替换成原始的Var
     * 碰到 EVar=>EVar这种的，直接简化成一层，碰到EmptyVar(IsMiddleVar=true)的，直接忽略掉
     */
    Parser.prototype.getSyntaxTreeFromOriginRules = function (tree) {
        tree.rootNode.markSubParents();
        var curNode = tree.firstMiddleVarNode();
        var items, item;
        while (curNode != null) {
            if (!curNode.parent) {
                throw new Error("inpossible state in common logic");
            }
            if (curNode.nodeVar instanceof EmptyVar) {
                curNode.parent.items.remove(curNode);
            }
            else if (curNode.nodeVar.isNotLeftVar) {
                curNode.nodeVar = curNode.nodeVar.originVar;
            }
            else {
                items = curNode.items;
                var idx = curNode.parent.items.indexOf(curNode);
                curNode.parent.items.removeAt(idx);
                for (var i = items.size() - 1; i >= 0; --i) {
                    item = items[i];
                    item.parent = curNode.parent;
                    curNode.parent.items.insertAt(idx, item);
                }
            }
            curNode = tree.firstMiddleVarNode();
        }
        // 简化EVar=>EVar这种为一层
        curNode = tree.firstRepeatNode();
        while (curNode != null) {
            if (curNode.parent == null) {
                throw new Error("inpossible state in common logic");
            }
            items = curNode.items;
            for (var j = 0; j < items.size(); ++j) {
                item = items.get(j);
                item.parent = curNode.parent;
            }
            curNode.parent.items = curNode.items;
            curNode = tree.firstRepeatNode();
        }
        return tree;
    };
    /**
     * 在已经parser成功的语法树上,重新从根节点开始进行匹配rules,并且在上面标注RuleItem的extraInfo
     */
    Parser.prototype.markextraInfoInSyntaxTreeNode = function (node, rules) {
        var foundRules = this.findRulesOfDestVar(node.nodeVar, rules);
        if (!foundRules || foundRules.size() < 1) {
            return;
        }
        var rule = foundRules[0];
        var item;
        for (var i = 0; i < rule.items.size(); ++i) {
            var ruleItem = rule.items.get(i);
            if (node.items.size() !== ruleItem.items.size()) {
                continue;
            }
            var matched = true;
            for (var j = 0; j < ruleItem.items.size(); ++j) {
                if (node.items[j].nodeVar != ruleItem.items[j]) {
                    matched = false;
                    break;
                }
            }
            if (matched) {
                node.extraInfo = ruleItem.extraInfo;
                for (var k = 0; k < node.items.size(); ++k) {
                    item = node.items[k];
                    this.markextraInfoInSyntaxTreeNode(item, rules);
                }
                if (ruleItem.extraInfo && ruleItem.extraInfo.length > 0) {
                    node.extraInfo = ruleItem.extraInfo;
                }
                else {
                    for (var m = 0; m < node.items.size(); ++m) {
                        item = node.items.get(m);
                        if (item.extraInfo && item.extraInfo.length > 0) {
                            node.extraInfo = item.extraInfo;
                            break;
                        }
                    }
                }
                return;
            }
        }
    };
    /**
     * when match next rule, may produce multiple options
     */
    Parser.prototype.tryMatchNext = function (tree, tokens, recursive) {
        if (recursive === undefined) {
            recursive = true;
        }
        var options = [];
        var remainingTokens = tokens;
        var remainingTokensCount = remainingTokens ? remainingTokens.size() : 0;
        if (remainingTokensCount > 0 || tree.leftUnBoundVar() != null) {
            tree = tree.cloneNew();
            var leftNode = tree.leftUnBoundVar();
            if (leftNode == null) {
                if (tokens.size() > 0) {
                    return null;
                }
                else {
                    options.push(new MatchOption(tree, tokens));
                    return options;
                }
            }
            else if (leftNode.nodeVar instanceof FinalVar) {
                if (leftNode.nodeVar instanceof EmptyVar) {
                    leftNode.valueToken = Token.empty;
                    leftNode.isBound = true;
                    options.push(new MatchOption(tree, tokens));
                    return options;
                }
                else if (tokens.head.tokenType === leftNode.nodeVar) {
                    leftNode.valueToken = tokens.head;
                    leftNode.isBound = true;
                    options.push(new MatchOption(tree, tokens.tail));
                    return options;
                }
                else {
                    return null;
                }
            }
            else {
                var rules = this.findRulesOfDestVar(leftNode.nodeVar);
                for (var i = 0; i < rules.size(); ++i) {
                    var rule = rules[i];
                    for (var j = 0; j < rule.items.size(); ++j) {
                        var ruleItem = rule.items[j];
                        var optionTree = tree.cloneNew();
                        var optionLeftNode = optionTree.leftUnBoundVar();
                        for (var k = 0; k < ruleItem.items.size(); ++k) {
                            var ruleItemVar = ruleItem.items.get(k);
                            optionLeftNode.isBound = true;
                            optionLeftNode.items.push(new SyntaxTreeNode(ruleItemVar));
                        }
                        options.push(new MatchOption(optionTree, tokens));
                    }
                }
                return options;
            }
        }
        else {
            options.push(new MatchOption(tree, tokens));
            return options;
        }
    };
    exports.Parser = Parser;
    var RegexReader = {};
    exports.RegexReader = RegexReader;
    function C(c) {
        return new CharExpr(c);
    }

    RegexReader.finalVarDict = null;
    function internFinalVar(name) {
        if (RegexReader.finalVarDict == null) {
            RegexReader.finalVarDict = {};
        }
        if (!RegexReader.finalVarDict[name]) {
            RegexReader.finalVarDict[name] = new FinalVar(name);
        }
        return RegexReader.finalVarDict[name];
    }

    /**
     * Supported features
     * '|'
     * ( ... ) group
     * \d digit
     * \w alpha or digit
     * \uabcd unicode char support
     * a-b char range
     * [abc] union
     * abc concat
     * a+ repeat at least one times
     * a* repeat at least zero times
     * a? repeat one or zero times
     * a{m[,n]} repeat at least m times [and at most n times]
     * . any char
     * \s space
     * \\ \+ \* \{ \[ \( \| \? \. \- ... escape
     */
    RegexReader.read = function (regex) {
        var escape = C('\\'); // \
        var escapeEscape = escape.concat(escape); // \\
        escapeEscape.markGroup("\\\\");
        var escapeAdd = escape.concat(C('+')); // \+
        escapeAdd.markGroup("\\+");
        var escapeMul = escape.concat(C('*')); // \*
        escapeMul.markGroup("\\*");
        var escapeHkh = escape.concat(C('{')); // \{
        escapeHkh.markGroup("\\{");
        var escapeZkh = escape.concat(C('[')); // \[
        escapeZkh.markGroup("\\[");
        var escapeXkh = escape.concat(C('(')); // \(
        escapeXkh.markGroup("\\(");
        var escapeRightHkh = escape.concat(C('}')); // \}
        escapeRightHkh.markGroup("\\}");
        var escapeRightZkh = escape.concat(C(']')); // \]
        escapeRightZkh.markGroup("\\]");
        var escapeRightXkh = escape.concat(C(')')); // \)
        escapeRightXkh.markGroup("\\)");
        var escapeOr = escape.concat(C('|')); // \|
        escapeOr.markGroup("\\|");
        var escapeOptional = escape.concat(C('?')); // \?
        escapeOptional.markGroup("\\?");
        var escapeAny = escape.concat(C('.')); // \.
        escapeAny.markGroup("\\.");
        var escapeTo = escape.concat(C('-')); // \-
        escapeTo.markGroup("\\-");
        var space = escape.concat(C('s')); // \s
        space.markGroup("\\s");
        var digit = escape.concat(C('d')); // \d
        digit.markGroup("\\d");
        var alphaOrDigit = escape.concat(C('w')); // \w
        alphaOrDigit.markGroup("\\w");
        var unicode = escape.concat(C('u')).concat(new DigitExpr().union(new AlphaExpr()).repeat(4));
        unicode.markGroup("unicode");
        var add = C('+');
        add.markGroup("+");
        var closure = C('*');
        closure.markGroup("*");
        var optional = C('?');
        optional.markGroup("?");
        var any = C('.');
        any.markGroup(".");
        var leftXkh = C('(');
        leftXkh.markGroup("(");
        var rightXkh = C(')');
        rightXkh.markGroup(")");
        var leftZkh = C('[');
        leftZkh.markGroup("[");
        var rightZkh = C(']');
        rightZkh.markGroup("]");
        var leftDkh = C('{');
        leftDkh.markGroup("{");
        var rightDkh = C('}');
        rightDkh.markGroup("}");
        var comma = C(',');
        comma.markGroup(",");
        var or = C('|');
        or.markGroup("|");
        var range = C('-');
        range.markGroup("-");
        // var charExpr = new CharRangeExpr(String.fromCharCode(0), String.fromCharCode(127));
        var charExpr = new CharNotInRangeExpr("+*?.()[]{},-|");
        charExpr.markGroup("char");
        var regexReaderExpr = RegexExpr.unionAll(escapeEscape, escapeAdd, escapeMul, escapeHkh, escapeZkh,
            escapeXkh, escapeRightHkh, escapeRightZkh, escapeRightXkh, escapeOr, escapeOptional, escapeAny, escapeTo, space, digit, alphaOrDigit, unicode, add, closure, optional, any, leftXkh, rightXkh,
            leftZkh, rightZkh, leftDkh, rightDkh, comma, or, range, charExpr);
        regexReaderExpr.build();
        var regexMatchedTokensFromRegex = regexReaderExpr.matchAll(regex);
        var tokenListBuiding = [];
        for (var i = 0; i < regexMatchedTokensFromRegex.matchedItems.length; ++i) {
            var tokenFromRegex = regexMatchedTokensFromRegex.matchedItems[i];
            var token = new Token(tokenFromRegex.matchedString.toString(), internFinalVar(tokenFromRegex.groupIdentity));
            tokenListBuiding.push(token);
        }
        var tokens = TokenList.create(tokenListBuiding);
        var EVar = new Var("E");
        var IVar = new Var("I");
        var cSeqVar = new Var("CharSeq");
        var iRule = new Rule(IVar, [
            RuleItem.create(internFinalVar(escapeEscape.groupIdentity)),
            RuleItem.create(internFinalVar(escapeTo.groupIdentity)),
            RuleItem.create(internFinalVar(escapeAdd.groupIdentity)),
            RuleItem.create(internFinalVar(escapeMul.groupIdentity)),
            RuleItem.create(internFinalVar(escapeHkh.groupIdentity)),
            RuleItem.create(internFinalVar(escapeRightHkh.groupIdentity)),
            RuleItem.create(internFinalVar(escapeZkh.groupIdentity)),
            RuleItem.create(internFinalVar(escapeRightZkh.groupIdentity)),
            RuleItem.create(internFinalVar(escapeXkh.groupIdentity)),
            RuleItem.create(internFinalVar(escapeRightXkh.groupIdentity)),
            RuleItem.create(internFinalVar(escapeOr.groupIdentity)),
            RuleItem.create(internFinalVar(escapeOptional.groupIdentity)),
            RuleItem.create(internFinalVar(escapeAny.groupIdentity)),
            RuleItem.create(internFinalVar(space.groupIdentity)).extra("space"),
            RuleItem.create(internFinalVar(digit.groupIdentity)).extra("digit"),
            RuleItem.create(internFinalVar(alphaOrDigit.groupIdentity)).extra("alphaOrDigit"),
            RuleItem.create(internFinalVar(unicode.groupIdentity)).extra("unicode"),
            RuleItem.create(internFinalVar(charExpr.groupIdentity))
        ]);
        var cSeqRule = new Rule(cSeqVar, [
            RuleItem.create(IVar),
            RuleItem.create(IVar, internFinalVar(range.groupIdentity), IVar).extra("a-b"),
            RuleItem.create(IVar, cSeqVar).extra("CharSeqConcat")
        ]);
        var eRule = new Rule(EVar, [
            RuleItem.create(internFinalVar(leftXkh.groupIdentity), EVar, internFinalVar(rightXkh.groupIdentity)).extra("(a)"),
            RuleItem.create(EVar, internFinalVar(or.groupIdentity), EVar).extra("a|b"),
            RuleItem.create(IVar),
            RuleItem.create(cSeqVar),
            RuleItem.create(internFinalVar(leftZkh.groupIdentity), cSeqVar, internFinalVar(rightZkh.groupIdentity)).extra("[abc]"),
            // new RuleItem(){items={
            //                internFinalVar(leftZkh.groupIdentity), IVar, internFinalVar(range.groupIdentity), IVar, internFinalVar(rightZkh.groupIdentity)
            //          }}.extra("[a-b]"),
            RuleItem.create(EVar, internFinalVar(closure.groupIdentity)).extra("Closure"),
            RuleItem.create(EVar, internFinalVar(add.groupIdentity)).extra("Repeat+"),
            RuleItem.create(EVar, internFinalVar(optional.groupIdentity)).extra("Optional"),
            RuleItem.create(EVar, internFinalVar(leftDkh.groupIdentity), cSeqVar, internFinalVar(rightDkh.groupIdentity)).extra("x{m}"),
            RuleItem.create(EVar, internFinalVar(leftDkh.groupIdentity), cSeqVar, internFinalVar(comma.groupIdentity), cSeqVar,
                internFinalVar(rightDkh.groupIdentity)).extra("x{m,n}"),
            RuleItem.create(EVar, EVar).extra("Concat")
        ]);
        var regexParser = new Parser(EVar, [iRule, cSeqRule, eRule], [
            EVar, IVar, cSeqVar
        ]);
        var regexSyntaxTree = regexParser.parse(tokens);
        return RegexReader.parseRegexStringSyntaxTreeNodeToRegexExpr(regexSyntaxTree.rootNode);
    };
    /**
     * 获得IVar节点的文本内容，如果有转义，要去掉转义符
     * @param node
     * @returns {*}
     * @constructor
     */
    RegexReader.gettextOfIVarNode = function (node) {
        return node.items[0].items[0].valueToken.text; // FIXME
    };
    /**
     * 因为cSeqVar节点是类似head-tail的结构，所以用这个方法来获取其实实际的所有元素
     */
    RegexReader.getAllitemsInCharSeqNode = function (node) {
        if (node.nodeVar.name !== "CharSeq" || node.items.size() > 2) {
            return [node];
        }
        if (node.items.size() === 1 || node.items.size() === 2) {
            var result = [];
            node.items.forEach(function (item) {
                result.addAll(RegexReader.getAllitemsInCharSeqNode(item));
            });
            return result;
        }
        throw new Error("impossible state");
    };
    /**
     * 从cSeqVar的节点中找到所有的字符
     * TODO: 这里还没考虑\w这类字符
     */
    RegexReader.getAllCharsInCharSeqNode = function (node, initial) {
        initial = initial || '';
        if (node.items.size() < 1) {
            return initial;
        }
        if (node.items.size() == 1) {
            return RegexReader.gettextOfIVarNode(node) + initial;
        }
        if (node.items.size() == 2) {
            return node.items[0].items[0].valueToken.text[0] + RegexReader.getAllCharsInCharSeqNode(node.items[1], initial);
        }
        throw new Error("not supported get chars in char seq node");
    };
    RegexReader.parseRegexStringSyntaxTreeNodeToRegexExpr = function (node) {
        if (node.nodeVar.name === "char") {
            return new CharExpr(node.valueToken.text[0]);
        }
        if (node.items.size() === 1) {
            return RegexReader.parseRegexStringSyntaxTreeNodeToRegexExpr(node.items[0]);
        }
        if (node.nodeVar.name === "I") {
            if (node.items[0].valueToken.text.length > 1 && node.items[0].valueToken.text.startsWith("\\")) {
                return new CharExpr(node.items[0].valueToken.text[1]);
            }
            if (node.extraInfo === "space") {
                return CharExpr.createUnionFromChars(" \n\t\r");
            }
            if (node.extraInfo === "digit") {
                return new DigitExpr();
            }
            if (node.extraInfo === "alphaOrDigit") {
                return new AlphaExpr().union(new DigitExpr());
            }
            if (node.extraInfo === "unicode") {
                return new CharExpr('\0'); // FIXME: now unicode not supported
            }
            throw new Error("not supported char type now");
        }
        if (node.extraInfo === "(a)") {
            return RegexReader.parseRegexStringSyntaxTreeNodeToRegexExpr(node.items[1]);
        }
        if (node.extraInfo === "a|b") {
            return RegexExpr.unionAll(RegexReader.parseRegexStringSyntaxTreeNodeToRegexExpr(node.items[0]), RegexReader.parseRegexStringSyntaxTreeNodeToRegexExpr(node.items[2]));
        }
        if (node.extraInfo === "Closure") {
            return RegexReader.parseRegexStringSyntaxTreeNodeToRegexExpr(node.items[0]).closure();
        }
        if (node.extraInfo === "Repeat+") {
            return RegexReader.parseRegexStringSyntaxTreeNodeToRegexExpr(node.items[0]).plus();
        }
        if (node.extraInfo === "Optional") {
            return RegexReader.parseRegexStringSyntaxTreeNodeToRegexExpr(node.items[0]).optional();
        }
        if (node.extraInfo === "x{m}") {
            return RegexReader.parseRegexStringSyntaxTreeNodeToRegexExpr(node.items[0]).repeat(parseInt(RegexReader.getAllCharsInCharSeqNode(node.items[2])));
        }
        if (node.extraInfo === "x{m,n}") {
            return RegexReader.parseRegexStringSyntaxTreeNodeToRegexExpr(node.items[0]).repeat(parseInt(node.items[2].valueToken.text), parseInt(node.items[4].valueToken.text));
        }
        if (node.extraInfo === "Concat") {
            return RegexReader.parseRegexStringSyntaxTreeNodeToRegexExpr(node.items[0]).concat(RegexReader.parseRegexStringSyntaxTreeNodeToRegexExpr(node.items[1]));
        }
        if (node.extraInfo === "a-b") {
            return new CharRangeExpr(node.items[0].valueToken.text[0], node.items[2].valueToken.text[1]);
        }
        if (node.extraInfo === "CharSeqConcat") {
            return RegexReader.parseRegexStringSyntaxTreeNodeToRegexExpr(node.items[0]).concat(RegexReader.parseRegexStringSyntaxTreeNodeToRegexExpr(node.items[1]));
        }
        if (node.extraInfo === "[abc]") {
            var items = RegexReader.getAllitemsInCharSeqNode(node.items[1]);
            var expritems = [];
            for (var i = 0; i < items.size(); ++i) {
                expritems.push(RegexReader.parseRegexStringSyntaxTreeNodeToRegexExpr(items[i]));
            }
            return RegexExpr.unionAll.apply(this, expritems);
        }
        if (node.items.size() === 1) {
            return RegexReader.parseRegexStringSyntaxTreeNodeToRegexExpr(node.items[0]);
        }
        if (node.nodeVar.name === "\\s") {
            return CharExpr.createUnionFromChars(" \n\t\r");
        }
        if (node.nodeVar.name === "\\.") {
            return new AnyCharExpr();
        }
        if (node.nodeVar.name === "\\d") {
            return new DigitExpr();
        }
        if (node.nodeVar.name === "\\w") {
            return new AlphaExpr().union(new DigitExpr());
        }
        if (["\\\\", "\\+", "\\-", "\\(", "\\)", "\\[", "\\]", "\\{", "\\}", "\\*", "\\,", "\\?"].indexOf(node.nodeVar.name) >= 0) {
            return new CharExpr(node.nodeVar.name[1]);
        }
        if (node.nodeVar.name === "unicode") {
            return new CharExpr('\0'); // FIXME: unicode not supported now
        }
        return null;
    };
})();