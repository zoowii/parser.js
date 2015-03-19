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
    if (Array.prototype.join === undefined) {
        Array.prototype.join = function (sep) {
            sep = sep || '';
            var result = '';
            for (var i = 0; i < this.length; ++i) {
                if (i < 1) {
                    result += sep;
                }
                if (this[i] !== null && this[i] !== undefined) {
                    result += this[i].toString();
                }
            }
            return result;
        }
    }
    if (Array.prototype.clear === undefined) {
        Array.prototype.clear = function () {
            this.length = 0;
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
        this.endGroupIdentity = null;
    }

    MatchResult.prototype.toString = function () {
        return '[MatchResult: Matched=' + this.matched + ', LastMatchedString=' + this.lastMatchedString + ', EndState=' + (this.endState?this.endState.toString():'') + ']';
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

    Set.prototype.get = function(index) {
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
                matchGroupResult.groupIdentity = matchResult.endGroupIdentity;
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
                    matchResult.endGroupIdentity = lastStateGroup;
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
        matchResult.endGroupIdentity = lastStateGroup;
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
    RegexExpr.prototype.getOrCreateInStateMapping = function (mapping, state) {
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
        expr.startState = this.getOrCreateInStateMapping(stateMapping, this.startState);
        var i;
        expr.states.clear();
        for (i = 0; i < this.states.length; ++i) {
            expr.states.push(this.getOrCreateInStateMapping(stateMapping, this.states[i]));
        }
        expr.acceptableStates.clear();
        for (i = 0; i < this.acceptableStates.length; ++i) {
            expr.acceptableStates.push(this.getOrCreateInStateMapping(stateMapping, this.acceptableStates[i]));
        }
        expr.transforms.clear();
        for (i = 0; i < this.transforms.length; ++i) {
            var trans = this.transforms[i];
            var from = this.getOrCreateInStateMapping(stateMapping, trans.from);
            var to = this.getOrCreateInStateMapping(stateMapping, trans.to);
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
})();