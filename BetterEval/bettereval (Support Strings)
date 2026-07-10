import java.util.*;

/**
 * 安全表达式求值器
 * 支持变量、字符串运算、布尔运算、算术运算及特殊规则
 * 用法: SafeEval.eval("1+1") 或 SafeEval.eval("1+x", vars)
 */
public class SafeEval {

    /**
     * 对表达式求值，使用默认空变量表
     */
    public static Object eval(String expression) {
        return eval(expression, Collections.emptyMap());
    }

    /**
     * 对表达式求值，可传入变量值
     * @param expr 表达式字符串
     * @param vars 变量名到值的映射
     * @return 计算结果（数字、字符串或布尔值）
     */
    public static Object eval(String expr, Map<String, Object> vars) {
        return new Parser(new Tokenizer(expr).tokenize(), vars).parseExpression();
    }

    // ==================== 词法分析 ====================
    private enum TokenType {
        NUMBER, STRING, BOOLEAN, IDENTIFIER,
        PLUS, MINUS, STAR, SLASH, PERCENT, BANG, PIPE,
        CARET, AND, OR, EQ, NEQ, LT, LE, GT, GE, IN,
        LPAREN, RPAREN, EOF
    }

    private static class Token {
        TokenType type;
        String text;
        Token(TokenType type, String text) { this.type = type; this.text = text; }
    }

    private static class Tokenizer {
        private final String input;
        private int pos = 0;

        Tokenizer(String input) { this.input = input.trim(); }

        List<Token> tokenize() {
            List<Token> tokens = new ArrayList<>();
            while (pos < input.length()) {
                char c = input.charAt(pos);
                if (Character.isWhitespace(c)) {
                    pos++;
                    continue;
                }
                // 数字
                if (Character.isDigit(c) || (c == '.' && pos + 1 < input.length() && Character.isDigit(input.charAt(pos + 1)))) {
                    tokens.add(readNumber());
                }
                // 字符串
                else if (c == '"') {
                    tokens.add(readString());
                }
                // 管道符 | 或 ||
                else if (c == '|') {
                    if (pos + 1 < input.length() && input.charAt(pos + 1) == '|') {
                        tokens.add(new Token(TokenType.OR, "||"));
                        pos += 2;
                    } else {
                        tokens.add(new Token(TokenType.PIPE, "|"));
                        pos++;
                    }
                }
                // 括号
                else if (c == '(') { tokens.add(new Token(TokenType.LPAREN, "(")); pos++; }
                else if (c == ')') { tokens.add(new Token(TokenType.RPAREN, ")")); pos++; }
                // 运算符
                else if (c == '+') { tokens.add(new Token(TokenType.PLUS, "+")); pos++; }
                else if (c == '-') { tokens.add(new Token(TokenType.MINUS, "-")); pos++; }
                else if (c == '*') { tokens.add(new Token(TokenType.STAR, "*")); pos++; }
                else if (c == '/') { tokens.add(new Token(TokenType.SLASH, "/")); pos++; }
                else if (c == '%') { tokens.add(new Token(TokenType.PERCENT, "%")); pos++; }
                else if (c == '^') { tokens.add(new Token(TokenType.CARET, "^")); pos++; }
                else if (c == '!') {
                    if (pos + 1 < input.length() && input.charAt(pos + 1) == '=') {
                        tokens.add(new Token(TokenType.NEQ, "!=")); pos += 2;
                    } else {
                        tokens.add(new Token(TokenType.BANG, "!")); pos++;
                    }
                }
                else if (c == '=') {
                    if (pos + 1 < input.length() && input.charAt(pos + 1) == '=') {
                        tokens.add(new Token(TokenType.EQ, "==")); pos += 2;
                    } else throw new RuntimeException("意外的字符 '='，期望 '=='");
                }
                else if (c == '<') {
                    if (pos + 1 < input.length() && input.charAt(pos + 1) == '=') {
                        tokens.add(new Token(TokenType.LE, "<=")); pos += 2;
                    } else {
                        tokens.add(new Token(TokenType.LT, "<")); pos++;
                    }
                }
                else if (c == '>') {
                    if (pos + 1 < input.length() && input.charAt(pos + 1) == '=') {
                        tokens.add(new Token(TokenType.GE, ">=")); pos += 2;
                    } else {
                        tokens.add(new Token(TokenType.GT, ">")); pos++;
                    }
                }
                else if (c == '&') {
                    if (pos + 1 < input.length() && input.charAt(pos + 1) == '&') {
                        tokens.add(new Token(TokenType.AND, "&&")); pos += 2;
                    } else throw new RuntimeException("意外的字符 '&'，期望 '&&'");
                }
                // 标识符/关键字
                else if (Character.isLetter(c) || c == '_') {
                    tokens.add(readIdentifier());
                }
                else {
                    throw new RuntimeException("非法字符: " + c);
                }
            }
            tokens.add(new Token(TokenType.EOF, ""));
            return tokens;
        }

        private Token readNumber() {
            int start = pos;
            while (pos < input.length() && (Character.isDigit(input.charAt(pos)) || input.charAt(pos) == '.')) {
                pos++;
            }
            return new Token(TokenType.NUMBER, input.substring(start, pos));
        }

        private Token readString() {
            pos++; // 跳过开始的引号
            StringBuilder sb = new StringBuilder();
            while (pos < input.length() && input.charAt(pos) != '"') {
                sb.append(input.charAt(pos));
                pos++;
            }
            if (pos >= input.length()) throw new RuntimeException("未闭合的字符串");
            pos++; // 跳过结束的引号
            return new Token(TokenType.STRING, sb.toString());
        }

        private Token readIdentifier() {
            int start = pos;
            while (pos < input.length() && (Character.isLetterOrDigit(input.charAt(pos)) || input.charAt(pos) == '_')) {
                pos++;
            }
            String name = input.substring(start, pos);
            if (name.equals("true") || name.equals("false")) {
                return new Token(TokenType.BOOLEAN, name);
            } else if (name.equals("in")) {
                return new Token(TokenType.IN, "in");
            } else {
                return new Token(TokenType.IDENTIFIER, name);
            }
        }
    }

    // ==================== 语法解析与求值 ====================
    private static class Parser {
        private final List<Token> tokens;
        private final Map<String, Object> variables;
        private int current = 0;

        Parser(List<Token> tokens, Map<String, Object> vars) {
            this.tokens = tokens;
            this.variables = new HashMap<>(vars);
        }

        private Token peek() { return tokens.get(current); }
        private Token previous() { return tokens.get(current - 1); }
        private Token advance() { if (!isAtEnd()) current++; return previous(); }
        private boolean isAtEnd() { return peek().type == TokenType.EOF; }
        private boolean check(TokenType type) { return !isAtEnd() && peek().type == type; }
        private Token consume(TokenType type, String error) {
            if (check(type)) return advance();
            throw new RuntimeException(error + "，但遇到: " + peek().text);
        }

        // ============ 表达式入口 ============
        Object parseExpression() {
            return parseXor();
        }

        // 异或 ^ (最低优先级)
        private Object parseXor() {
            Object left = parseOr();
            while (match(TokenType.CARET)) {
                Object right = parseOr();
                left = xorOp(left, right);
            }
            return left;
        }

        // 逻辑或 ||
        private Object parseOr() {
            Object left = parseAnd();
            while (match(TokenType.OR)) {
                Object right = parseAnd();
                left = booleanOp(left, right, "||");
            }
            return left;
        }

        // 逻辑与 &&
        private Object parseAnd() {
            Object left = parseEquality();
            while (match(TokenType.AND)) {
                Object right = parseEquality();
                left = booleanOp(left, right, "&&");
            }
            return left;
        }

        // 相等 == != 及 in
        private Object parseEquality() {
            Object left = parseComparison();
            while (match(TokenType.EQ, TokenType.NEQ, TokenType.IN)) {
                TokenType op = previous().type;
                Object right = parseComparison();
                if (op == TokenType.EQ) left = equal(left, right);
                else if (op == TokenType.NEQ) left = !(boolean) equal(left, right);
                else if (op == TokenType.IN) left = contains(left, right);
            }
            return left;
        }

        // 比较 < <= > >=
        private Object parseComparison() {
            Object left = parsePlusMinus();
            while (match(TokenType.LT, TokenType.LE, TokenType.GT, TokenType.GE)) {
                TokenType op = previous().type;
                Object right = parsePlusMinus();
                double l = toDouble(left, true);
                double r = toDouble(right, true);
                boolean res;
                switch (op) {
                    case LT: res = l < r; break;
                    case LE: res = l <= r; break;
                    case GT: res = l > r; break;
                    case GE: res = l >= r; break;
                    default: throw new RuntimeException("未知比较运算符");
                }
                left = res;
            }
            return left;
        }

        // 加减 + -
        private Object parsePlusMinus() {
            Object left = parseMulDivMod();
            while (match(TokenType.PLUS, TokenType.MINUS)) {
                TokenType op = previous().type;
                Object right = parseMulDivMod();
                if (op == TokenType.PLUS) {
                    left = plus(left, right);
                } else {
                    left = minus(left, right);
                }
            }
            return left;
        }

        // 乘除模 * / %
        private Object parseMulDivMod() {
            Object left = parseUnary();
            while (match(TokenType.STAR, TokenType.SLASH, TokenType.PERCENT)) {
                TokenType op = previous().type;
                Object right = parseUnary();
                if (op == TokenType.STAR) {
                    left = multiply(left, right);
                } else if (op == TokenType.SLASH) {
                    left = divide(left, right);
                } else {
                    left = mod(left, right);
                }
            }
            return left;
        }

        // 一元运算符 ! - + |...|
        private Object parseUnary() {
            if (match(TokenType.BANG)) {
                return !isTruthy(parseUnary());
            }
            if (match(TokenType.MINUS)) {
                return -toDouble(parseUnary(), true);
            }
            if (match(TokenType.PLUS)) {
                return toDouble(parseUnary(), true);
            }
            if (match(TokenType.PIPE)) {
                Object inner = parseExpression();
                consume(TokenType.PIPE, "期望闭合的管道符 '|'");
                return inner.toString().length();
            }
            return parsePrimary();
        }

        // 原子：数字、字符串、布尔值、变量、括号表达式
        private Object parsePrimary() {
            if (match(TokenType.NUMBER)) {
                return parseNumber(previous().text);
            }
            if (match(TokenType.STRING)) {
                return previous().text;
            }
            if (match(TokenType.BOOLEAN)) {
                return Boolean.parseBoolean(previous().text);
            }
            if (match(TokenType.IDENTIFIER)) {
                String name = previous().text;
                if (variables.containsKey(name)) {
                    return variables.get(name);
                }
                throw new RuntimeException("未定义的变量: '" + name + "'");
            }
            if (match(TokenType.LPAREN)) {
                Object val = parseExpression();
                consume(TokenType.RPAREN, "期望 ')'");
                return val;
            }
            throw new RuntimeException("意外的 token: " + peek().text);
        }

        private boolean match(TokenType... types) {
            for (TokenType t : types) {
                if (check(t)) {
                    advance();
                    return true;
                }
            }
            return false;
        }

        // ==================== 辅助方法 ====================

        /** 解析数字，尽可能返回整数类型 */
        private Object parseNumber(String text) {
            if (text.contains(".")) {
                return Double.parseDouble(text);
            }
            long val = Long.parseLong(text);
            if (val >= Integer.MIN_VALUE && val <= Integer.MAX_VALUE) {
                return (int) val;
            }
            return val;
        }

        /**
         * 将值转为 double
         * @param forAddSub true 表示加减场景（字符串视为0），false 表示乘除场景（字符串视为1）
         */
        private double toDouble(Object val, boolean forAddSub) {
            if (val instanceof Number) return ((Number) val).doubleValue();
            if (val instanceof String) return forAddSub ? 0.0 : 1.0;
            if (val instanceof Boolean) return ((Boolean) val) ? 1.0 : 0.0;
            throw new RuntimeException("无法转换为数字: " + val);
        }

        /** 判断 truthy 值 */
        private boolean isTruthy(Object val) {
            if (val instanceof Boolean) return (Boolean) val;
            if (val instanceof String) return !((String) val).isEmpty();
            if (val instanceof Number) return ((Number) val).doubleValue() != 0;
            return false;
        }

        /** 加法：两个字符串则连接，否则算术加法 */
        private Object plus(Object left, Object right) {
            if (left instanceof String && right instanceof String) {
                return (String) left + (String) right;
            }
            double l = toDouble(left, true);
            double r = toDouble(right, true);
            return wrapNumber(l + r);
        }

        /** 减法：算术减法 */
        private Object minus(Object left, Object right) {
            return wrapNumber(toDouble(left, true) - toDouble(right, true));
        }

        /** 乘法：字符串视为1 */
        private Object multiply(Object left, Object right) {
            return wrapNumber(toDouble(left, false) * toDouble(right, false));
        }

        /** 除法：正数/0=Infinity，负数/0=-Infinity，0/0=NaN */
        private Object divide(Object left, Object right) {
            double l = toDouble(left, false);
            double r = toDouble(right, false);
            if (r == 0.0) {
                if (l == 0.0) return Double.NaN;
                return l > 0 ? Double.POSITIVE_INFINITY : Double.NEGATIVE_INFINITY;
            }
            return l / r;
        }

        /** 取模 */
        private Object mod(Object left, Object right) {
            double l = toDouble(left, false);
            double r = toDouble(right, false);
            if (r == 0.0) return Double.NaN;
            return wrapNumber(l % r);
        }

        /** 相等判断 */
        private Object equal(Object left, Object right) {
            if (left instanceof String && right instanceof String) return left.equals(right);
            if (left instanceof Boolean && right instanceof Boolean) return left.equals(right);
            double l = toDouble(left, true);
            double r = toDouble(right, true);
            return l == r;
        }

        /** a in b：判断 a 是否是 b 的子串 */
        private Object contains(Object left, Object right) {
            return right.toString().contains(left.toString());
        }

        /** 布尔运算 */
        private Object booleanOp(Object left, Object right, String op) {
            boolean l = isTruthy(left);
            boolean r = isTruthy(right);
            if (op.equals("&&")) return l && r;
            else return l || r;
        }

        /** 异或运算 */
        private Object xorOp(Object left, Object right) {
            return isTruthy(left) ^ isTruthy(right);
        }

        /** 包装数字，尽可能返回整数类型 */
        private Object wrapNumber(double value) {
            if (Double.isNaN(value) || Double.isInfinite(value)) {
                return value;
            }
            if (value == Math.floor(value) && !Double.isInfinite(value)) {
                long longVal = (long) value;
                if (longVal >= Integer.MIN_VALUE && longVal <= Integer.MAX_VALUE) {
                    return (int) longVal;
                }
                return longVal;
            }
            return value;
        }
    }

    // ==================== 测试 ====================
    public static void main(String[] args) {
        Map<String, Object> vars = new HashMap<>();
        vars.put("x", 5);

        // 示例测试
        System.out.println("1+1 = " + eval("1+1"));
    }
}
