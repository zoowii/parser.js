parser.js
====
A parser library implemented by JavaScript, including tools like lex/yacc and include simple api to generate syntax tree

## Author

* [zoowii](https://github.com/zoowii)

## Features

* 实现了一个基于NFA的正则表达式引擎实现(正则表达式字符串的解析使用自身实现的底层API和下面的语法解析引擎来实现的),支持主要正则功能已经分组捕获等
* 实现了一个语法解析引擎(支持左递归定义,语法定义简单)
* 提供一个整合了词法分析和语法分析的API,方便使用,可以直接生成最终满足要求的抽象语法树(直接生成最初定义规则对应的抽象语法树,而不是解析过程中的中间产物)
* 为了性能考虑,另外提供了一个使用内置正则引擎的快速词法分析实现,并且尽量兼容自己实现的正则API,从而可以在性能有问题时切换
* 直接浏览器和Node.js环境,且不依赖任何第三方库


## TODO

* unicode支持(匹配js的unicode字符没实现)
* 语法分析引擎能自动给出足够有效的错误提示
* 分组捕获在单字符捕获时有BUG(暂时可以用OtherChars来绕过)
* 优雅的整合词法分析和语法分析API,方便使用,可以直接生成最终满足要求的语法分析树(完成)
* 优化正则表达式引擎的性能


## 正则表达式语法和语法分析引擎的规则定义方式见后文


## Demo(更多例子看源码中的parser-test.js)

* 正则表达式引擎demo

```
    console.log('-----test regex string reader=====');
    var expr1 = RegexReader.read("\"(a{3,})(b+)(([c\\s\\.\\d\\\\\\+\\u1234])*)");
    expr1.build();
    console.log('regex build done');
    var r1 = expr1.match("aabbbc 123+556end");
    var r2 = expr1.match("\"aaaabbbc 123+556");
    // var expr2 = RegexReader.read("abc");
    console.log(expr1.toString());
    console.log(r1.toString());
    console.log(r2.toString());
    assert.equal(false, r1.matched);
    assert.equal(true, r2.matched);
    console.log('-----end test regex string reader-----');
```

* 语法分析demo

```
    console.log('-----test parser api-----');
    parser.clearVarCache();
    var syntaxParserAndTokener = parser.buildSyntaxTreeParser(V('json'), [
        [V('bool'),
            "(?:true|false)\\s*"],
        [V('number'),
            "(?:[+-]?(?:(0x[0-9a-fA-F]+|0[0-7]+)|((?:[0-9]+(?:\\.[0-9]*)?|\\.[0-9]+)(?:[eE][+-]?[0-9]+)?|NaN|Infinity)))\\s*"],
        [V('string'),
            "(?:(?:\"((?:\\.|[^\"])*)\"|'((?:\\.|[^'])*)'))\\s*"],
        [V('name'),
            V('string')],
        [V('value'),
            V('bool'), V('number'), V('string'), V('json-object'), V('json-array')],
        [V('json-object-pair'),
            [V('name'), ":\\s*", V('value')]],
        [V('json-object-pairs'),
            V('json-object-pair'),
            [V('json-object-pair'), ",\\s*", V('json-object-pairs')]
        ],
        [V('json-object'),
            ["\\{\\s*", V('json-object-pairs'), "\\}\\s*"]],
        [V('values'),
            V('value'),
            [V('value'), ",\\s*", V('values')]],
        [V('json-array'),
            ["\\[\\s*", V('values'), "]\\s*"]],
        [V('json'),
            V('json-object'), V('json-array'), [V("\\s+"), V('json')]]
    ]);
    var jsonParser = syntaxParserAndTokener.parser;
    var tokenPatterns = syntaxParserAndTokener.token_patterns;
    var text = '{"name": "zoowii", "age": 24, "position": {"country": "China", "city": "Nanjing"}}';
    var tokens = parser.generateTokenListUsingInnerRegex(tokenPatterns, text, console.log);
    var json = jsonParser.parse(tokens);
    console.log(json.toString());
    console.log('-----end test parser api-----');
```

* 正则引擎API的demo(非正则表达式字符串形式)

```
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
```


## 语法规则定义(另有基础API的方式也可以定义,这是为了方便使用提供的API)

语法规则定义方法如下:

rules: `[ rule1, rule2, rule3, ... ]`

rule: `[ 目标Var, ruleItem1, ruleItem2, ... ]`

ruleItem:

```
    正则表达式字符串
    | Var实例
    | [ Var实例或者正则表达式字符串, ... ]
    | {name: '子规则名称,非var,在最终语法分析树中会有体现,没有这项的前面2种ruleItem,name其实是目标Var的名称', rule: ruleItem}
```

## 正则表达式语法(可扩展)

* '|'
* ( ... ) group
* \d digit
* \w alpha or digit
* \uabcd unicode char support
* a-b char range
* [abc] union
* [^abc] except union
* abc concat
* a+ repeat at least one times
* a* repeat at least zero times
* a? repeat one or zero times
* a{m[,n]} repeat at least m times [and at most n times]
* . any char
* \s space
* \\ \+ \* \{ \[ \( \| \? \. \- ... escape
