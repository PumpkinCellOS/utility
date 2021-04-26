/*
    HW Planner Exe_parser.js
    Sppmacd (c) 2020
*/

module.exports = {
    whitespace : function(c) { return /\s/.test(c) },
    digit : function(c) { return /\d/.test(c) },
    word : function(c) { return /\w/.test(c) },

    TOKEN_SLASH :      0,
    TOKEN_LEFTBRACE :  1,
    TOKEN_RIGHTBRACE : 2,
    TOKEN_VALUE :      3,
    TOKEN_COMMA :      4,
    TOKEN_DASH :       5,
    TOKEN_DOT :        6,
    TOKEN_STAR :       7,
        
    Token : class
    {
        constructor(type, value) {
            this.type = type;
            this.value = value;
        }
    },

    Lexer : class
    {
        constructor(string) {
            this.string = string;
            this.streamPos = 0;
        }
        
        eof() {
            return this.streamPos >= this.string.length;
        }
        
        read(count) {
            if(this.eof())
                return -1;
            this.streamPos += count;
            return this.string.substring(this.streamPos - count, Math.min(this.streamPos, this.string.length));
        }
        
        peek() {
            //console.log("peek");
            return this.string[this.streamPos];
        }
        
        ignore(count, delim) {
            this.consume(count, delim);
        }
        
        consume(count, delim) {
            //console.log("consume " + this.streamPos);
            if(count == -1)
                count = 65536;

            if(typeof delim == "function")
            {
                var str = "";
                var read = 0;
                while(!this.eof() && delim(this.peek()) && read < count)
                {
                    //console.log("consume while " + str + " " + read);
                    str += this.read(1);
                    read++;
                }
                //console.log("consume:: " + str);
                return str;
            }
            else
                return this.consume(count, function(c) { return c == delim; });
        }
    },

    Parser : class {
        constructor(tokens)
        {
            this.tokens = tokens;
            this.streamPos = 0;
        }
        
        eof()
        {
            return this.streamPos >= this.tokens.length;
        }
        
        consumeOfType(type)
        {
            //console.log("consumeOfType: " + type);
            var p = this.peek();
            //console.log(p);
            if(this.eof())
                return null;
            if(p.type == type)
            {
                this.streamPos++;
                return p;
            }
            return null;
        }
        
        consume()
        {
            var tmp = this.peek();
            this.streamPos++;
            return tmp;
        }
        
        peek()
        {
            return this.eof() ? null : this.tokens[this.streamPos];
        }
        
        seek(val)
        {
            this.streamPos = val;
        }
        
        current()
        {
            return this.streamPos;
        }
    },

    lexAll : function(lexer)
    {
        var tokens = [];
        while(!lexer.eof())
        {
            var ch = lexer.peek();
            //console.log("peek " + ch);
            if(this.word(ch) || this.digit(ch))
            {
                var value = lexer.consume(-1, this.word);
                tokens.push(new this.Token(this.TOKEN_VALUE, value));
            }
            else if(ch == '/')
            {
                var value = lexer.consume(1, '/');
                tokens.push(new this.Token(this.TOKEN_SLASH, value));
            }
            else if(ch == '{')
            {
                var value = lexer.consume(1, '{');
                tokens.push(new this.Token(this.TOKEN_LEFTBRACE, value));
            }
            else if(ch == '}')
            {
                var value = lexer.consume(1, '}');
                tokens.push(new this.Token(this.TOKEN_RIGHTBRACE, value));
            }
            else if(ch == ',')
            {
                var value = lexer.consume(1, ',');
                tokens.push(new this.Token(this.TOKEN_COMMA, value));
            }
            else if(ch == '-')
            {
                var value = lexer.consume(1, '-');
                tokens.push(new this.Token(this.TOKEN_DASH, value));
            }
            else if(ch == '.')
            {
                var value = lexer.consume(1, '.');
                tokens.push(new this.Token(this.TOKEN_DOT, value));
            }
            else if(ch == '*')
            {
                var value = lexer.consume(1, '*');
                tokens.push(new this.Token(this.TOKEN_STAR, value));
            }
            else
                break;
        }
        return tokens;
    },

    // glob-selector ::= TOKEN_STAR

    // topic-expression ::= TOKEN_VALUE TOKEN_DOT...

    // interval-expression ::= value(!interval-expression) TOKEN_DASH value(!interval-expression)
    
    // value ::= topic-expression | interval-expression | glob-selector | TOKEN_VALUE

    // type ::= /[a-zA-Z_]/

    // type-value ::= type value

    // value-seq ::= [value TOKEN_COMMA...]

    // ranged-type-value ::= type TOKEN_LEFTBRACE value-seq TOKEN_RIGHTBRACE

    // ranged-definer ::= TOKEN_LEFTBRACE [definition TOKEN_COMMA...] TOKEN_RIGHTBRACE

    // definer ::= ranged-definer | ranged-type-value | type-value | glob-selector

    // definition ::= definer TOKEN_SLASH...

    // all ::= [definition,...]

    parseRangedDefiner : function(parser)
    {
        //console.log(" -- parseRangedDefiner -- ");
        var value = [];
        
        var lb = parser.consumeOfType(this.TOKEN_LEFTBRACE);
        if(!lb)
            return null;
        
        while(true)
        {
            var valueEntry = this.parseDefinition(parser);
            if(!valueEntry)
                return null;

            value.push(valueEntry);
            
            var comm = parser.consumeOfType(this.TOKEN_COMMA);
            if(!comm)
                break;
        }
        
        var rb = parser.consumeOfType(this.TOKEN_RIGHTBRACE);
        if(!rb)
            return null;
        
        return value;
    },

    parseTopicExpression : function(parser)
    {
        var topicExpression = {"type": "topic-expression", "value": []};
        var firstDot = false;
        while(true)
        {
            var val = parser.consumeOfType(this.TOKEN_VALUE);
            if(!val)
                return null;
            
            topicExpression.value.push(val.value);
            
            var dot = parser.consumeOfType(this.TOKEN_DOT);
            //console.log("TOPIC" + dot);
            if(!dot)
            {
                if(!firstDot)
                    return null;
                break;
            }
            
            firstDot = true;
        }
        return topicExpression;
    },
    
    parseIntervalExpression : function(parser)
    {
        var valueLeft = this.parseValue(parser, false);
        if(!valueLeft)
            return null;
        
        var dash = parser.consumeOfType(this.TOKEN_DASH);
        if(!dash)
            return null;
        
        var valueRight = this.parseValue(parser, false);
        if(!valueRight)
            return null;
        
        return {type: "interval", left: valueLeft, right: valueRight};
    },

    parseValue : function(parser, allowInterval = true)
    {
        //console.log("parseValue");
        var value = {};
        var tmp = parser.current();
        
        var topicExpression = this.parseTopicExpression(parser);
        if(!topicExpression)
        {
            parser.seek(tmp);
            var intervalExpression = allowInterval ? this.parseIntervalExpression(parser) : null;
            if(!intervalExpression)
            {
                parser.seek(tmp);
                var globSelector = this.parseGlobSelector(parser);
                if(!globSelector)
                {
                    parser.seek(tmp);
                    value = parser.consumeOfType(this.TOKEN_VALUE);
                    if(!value)
                    {
                        parser.seek(tmp);
                        return null;
                    }
                    return value.value;
                }
                return typeValue;
            }
            return intervalExpression;
        }
        return topicExpression;
    },

    parseValueSeq : function(parser)
    {
        var valueSeq = [];
        
        while(true)
        {
            var val = this.parseValue(parser);
            if(!val)
                return null;
            valueSeq.push(val);
            
            var comm = parser.consumeOfType(this.TOKEN_COMMA);
            if(!comm)
                break;
        }

        return valueSeq;
    },

    parseRangedTypeValue : function(parser)
    {
        var type;
        var rangedTV;
        var type = parser.peek();
        if(type.type == this.TOKEN_VALUE)
        {
            //console.log("parseRangedTypeValue :)");
            type = parser.consume().value;
            var lb = parser.consumeOfType(this.TOKEN_LEFTBRACE);
            if(!lb)
                return null;
            
            rangedTV = this.parseValueSeq(parser);
            //console.log("rangedTV "+ JSON.stringify(rangedTV));
            if(!rangedTV)
                return null;
            
            var rb = parser.consumeOfType(this.TOKEN_RIGHTBRACE);
            if(!rb)
                return null;
            return {"type": type, "value": rangedTV};
        }
        return null;
    },

    parseTypeValue : function(parser)
    {
        var tv = {};
        var value = parser.peek();
        if(!value || value.type != this.TOKEN_VALUE || value.value.length < 2)
            return null;

        tv.type = value.value[0];
        value.value = value.value.substring(1);
        
        var val = this.parseValue(parser);
        if(!val)
            return null;
        
        tv.value = val;
        return tv;
    },

    parseGlobSelector : function(parser)
    {
        //console.log("parseGlobSelector");
        var star = parser.consumeOfType(this.TOKEN_STAR);
        if(!star)
            return null;
        return star.value;
    },

    parseDefiner : function(parser)
    {
        var definer = {};
        var tmp = parser.current();
        var rangedDefiner = this.parseRangedDefiner(parser);
        if(!rangedDefiner)
        {
            //console.log("parseDefiner: !rangedDefiner");
            parser.seek(tmp);
            var rangedTypeValue = this.parseRangedTypeValue(parser);
            if(!rangedTypeValue)
            {
                //console.log("parseDefiner: !rangedTypeValue");
                parser.seek(tmp);
                var globSelector = this.parseGlobSelector(parser);
                if(!globSelector)
                {
                    //console.log("parseDefiner: !globSelector");
                    parser.seek(tmp);
                    var typeValue = this.parseTypeValue(parser);
                    if(!typeValue)
                    {
                        //console.log("parseDefiner: !typeValue");
                        parser.seek(tmp);
                        return null;
                    }
                    return typeValue;
                }
                return globSelector;
            }
            return rangedTypeValue;
        }
        return rangedDefiner;
    },

    parseDefinition : function(parser)
    {
        var definition = [];
        while(true)
        {
            //console.log("parseDefinition");
            var definer = this.parseDefiner(parser);
            if(!definer)
                return null;

            //console.log("parseDefinition :)" + JSON.stringify(definer));
            definition.push(definer);
            if(!parser.consumeOfType(this.TOKEN_SLASH))
                break;
        }
        return definition;
    },

    parseAll : function(parser)
    {
        var output = [];
        
        while(!parser.eof())
        {
            var definition = this.parseDefinition(parser);
            if(!definition)
                return null;
            
            output.push(definition);
            if(!parser.consumeOfType(this.TOKEN_COMMA))
                break;
        }
        return output;
    },

    /*
    * Syntax:
    * {[expr]/...}
    */
    parse : function(str)
    {
        var lexer = new this.Lexer(str);
        var parser = new this.Parser(this.lexAll(lexer));
        return this.parseAll(parser);
    }
};
