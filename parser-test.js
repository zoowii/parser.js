var parser = require('./parser');


function testRegexEngine() {
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
    console.log(expr);
    console.log(expr4);
    var r1 = expr.match("aaaacb345dddd");
    console.log(r1.toString());
    console.log(r1.equals(parser.MatchResult.of(false, "aaaacb345")));
    var r2 = expr4.match("bb");
    console.log(r2.toString());
    console.log(r2.equals(parser.MatchResult.of(true, "bb")));
    var r3 = expr3.match("aaabcb");
    console.log(r3.toString());
    console.log(r3.equals(parser.MatchResult.of(true, "aaabcb")));
    var r4 = expr2.match("aaabcbc123");
    console.log(r4.toString());
    console.log(r4.equals(parser.MatchResult.of(false, "aaabcbc")));
    var r5 = expr5.match("zoOwIi1992@NJU");
    console.log(r5.toString());
    console.log(r5.equals(parser.MatchResult.of(false, "zoOwIi1992")));
    var r6 = iden.union(ops).matchAll("def fib(n) n = n + 1 end");
    console.log(r6.toString());
    console.log(r6.count() === 8);
}
function testSimpleGroup() {
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
}
testRegexEngine();
testSimpleGroup();