var parser = require('./parser');
var assert = require('assert');
var Var = parser.Var,
    FinalVar = parser.FinalVar,
    Parser = parser.Parser,
    Rule = parser.Rule,
    RuleItem = parser.RuleItem,
    TokenList = parser.TokenList,
    Token = parser.Token,
    RegexReader = parser.RegexReader;


function testRegexEngine() {
    console.log('-----start test regex engine-----');
    var a = new parser.CharExpr('a');
    var b = new parser.CharExpr('b');
    var c = new parser.CharExpr('c');
    var chars = new parser.AlphaExpr();
    var digit = new parser.DigitExpr();
    var expr = a.plus().concat(b.union(c).plus()).concat(digit.plus().optional());
    var expr2 = a.plus().concat(b.union(c).repeat(3, 5));
    var bc = b.union(c);
    var expr3 = a.plus().concat(bc.repeat(3, 5));
    var expr4 = b.concat(b).concat(b.optional());
    var iden = chars.plus().concat((chars.union(digit)).closure());
    iden.markGroup("identity");
    var ops = parser.CharExpr.createUnionFromChars("+-*/=");
    ops.markGroup("operation");

    var expr5 = chars.plus().concat(digit.plus());
    expr5.build();
    expr4.build();
    expr3.build();
    expr2.build();
    expr.build();
    console.log(expr.toString());
    console.log(expr4.toString());
    var r1 = expr.match("aaaacb345dddd");
    console.log(r1.toString());
    assert.equal(true, r1.equals(parser.MatchResult.of(false, "aaaacb345")));
    var r2 = expr4.match("bb");
    console.log(r2.toString());
    assert.equal(true, r2.equals(parser.MatchResult.of(true, "bb")));
    var r3 = expr3.match("aaabcb");
    console.log(r3.toString());
    assert.equal(true, r3.equals(parser.MatchResult.of(true, "aaabcb")));
    var r4 = expr2.match("aaabcbc123");
    console.log(r4.toString());
    assert.equal(true, r4.equals(parser.MatchResult.of(false, "aaabcbc")));
    var r5 = expr5.match("zoOwIi1992@NJU");
    console.log(r5.toString());
    assert.equal(true, r5.equals(parser.MatchResult.of(false, "zoOwIi1992")));
    var r6 = iden.union(ops).matchAll("def fib(n) n = n + 1 end");
    console.log(r6.toString());
    assert.equal(r6.count(), 8);
    console.log('-----end test regex engine-----');
}
function testSimpleGroup() {
    console.log('-----test simple group-----');
    var a = new parser.EmptyExpr().concat(new parser.CharExpr('a')).concat(new parser.EmptyExpr());
    a.markGroup("a");
    var b = new parser.EmptyExpr().concat(new parser.CharExpr('b')).concat(new parser.EmptyExpr());
    b.markGroup("b");
    var any = new parser.CharNotInRangeExpr("ab"); // FIXME: if using new AnyCharExpr(), there will be bug of group feature
    any.markGroup("char");
    var expr = parser.RegexExpr.unionAll(a, b, any);
    expr.build();
    var str = "abcdaebf";
    var res = expr.matchAll(str);
    console.log(res);
    console.log('-----end test simple group-----');
}
testRegexEngine();
testSimpleGroup();

function testSimpleParser() {
    console.log('-----test simple parser-----');
    // a + b * c, symbol, +, *
    // E => E * E | E + E | (E) | I, I => symbol
    var EVar = new Var("E");
    var iVar = new Var("I");
    var mulVar = new FinalVar("*");
    var addVar = new FinalVar("+");
    var leftVar = new FinalVar("(");
    var rightVar = new FinalVar(")");
    var symbolVar = new FinalVar("Symbol");
    var rule1 = new Rule(EVar, [
        new RuleItem([leftVar, EVar, rightVar]),
        new RuleItem([iVar]),
        new RuleItem([EVar, mulVar, EVar]),
        new RuleItem([EVar, addVar, EVar])
    ]);
    var rule2 = new Rule(iVar, [
        new RuleItem([symbolVar])
    ]);
    var myparser = new Parser(EVar, [rule1, rule2], [EVar, iVar, mulVar, addVar, leftVar, rightVar, symbolVar]);
    var tokens = TokenList.create(
        new Token('a', symbolVar),
        new Token('+', addVar),
        new Token('(', leftVar),
        new Token('b', symbolVar),
        new Token('*', mulVar),
        new Token('c', symbolVar),
        new Token(')', rightVar)
    );
    var syntaxTree = myparser.parse(tokens);
    console.log(syntaxTree.toString());
    assert.equal(syntaxTree.toString(), "a + ( b * c )");
    console.log('-----end test simple parser-----');
}
function testFailParser() {
    console.log('-----test fail parser-----');
// a + b * c, symbol, +, *
    // E => E * E | E + E | (E) | I, I => symbol
    var EVar = new Var("E");
    var iVar = new Var("I");
    var mulVar = new FinalVar("*");
    var addVar = new FinalVar("+");
    var leftVar = new FinalVar("(");
    var rightVar = new FinalVar(")");
    var symbolVar = new FinalVar("Symbol");
    var rule1 = new Rule(EVar, [
        new RuleItem([leftVar, EVar, rightVar]),
        new RuleItem([iVar]),
        new RuleItem([EVar, mulVar, EVar]),
        new RuleItem([EVar, addVar, EVar])
    ]);
    var rule2 = new Rule(iVar, [
        new RuleItem([symbolVar])
    ]);
    var myparser = new Parser(EVar, [rule1, rule2], [EVar, iVar, mulVar, addVar, leftVar, rightVar, symbolVar]);
    var tokens = TokenList.create(
        new Token('a', symbolVar),
        new Token('+', addVar),
        new Token('(', leftVar),
        new Token('b', symbolVar),
        new Token('*', mulVar),
        new Token('c', symbolVar)
    );
    var syntaxTree = myparser.parse(tokens);
    assert.equal(null, syntaxTree);
    console.log('-----end test fail parser-----');
}
function testRegexStringReader() {
    console.log('-----test regex string reader=====');
    var expr1 = RegexReader.read("(a{3})(b+)(([c\\s\\.\\d\\\\\\+\\u1234])*)");
    expr1.build();
    var r1 = expr1.match("aabbbc 123+556end");
    var r2 = expr1.match("aaabbbc 123+556");
    // var expr2 = RegexReader.read("abc");
    console.log(expr1.toString());
    console.log(r1.toString());
    console.log(r2.toString());
    assert.equal(false, r1.matched);
    assert.equal(true, r2.matched);
    console.log('-----end test regex string reader-----');
}
testSimpleParser();
testFailParser();
testRegexStringReader();