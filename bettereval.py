import operator

def calculate(expr):
    """支持+-*/%和逻辑运算的表达式计算"""
    
    ops = {
        '!': (6, lambda a: not a, 'right', 1),
        '*': (5, operator.mul, 'left', 2),
        '/': (5, operator.truediv, 'left', 2),
        '%': (5, operator.mod, 'left', 2),
        '+': (4, operator.add, 'left', 2),
        '-': (4, operator.sub, 'left', 2),
        '<': (3, operator.lt, 'left', 2),
        '>': (3, operator.gt, 'left', 2),
        '<=': (3, operator.le, 'left', 2),
        '>=': (3, operator.ge, 'left', 2),
        '==': (2, operator.eq, 'left', 2),
        '!=': (2, lambda a,b: a != b, 'left', 2),
        '&&': (1, lambda a,b: bool(a) and bool(b), 'left', 2),
        '||': (0, lambda a,b: bool(a) or bool(b), 'left', 2)
    }

    def is_math_expression(s):
        return any(op in s for op in ops.keys()) or any(c.isdigit() for c in s)

    if not is_math_expression(expr[1:len(expr) - 1]):
        return expr[1:len(expr) - 1]
    
    def eval_rpn(tokens):
        stack = []
        for token in tokens:
            if isinstance(token, (int, float)):
                stack.append(token)
            else:
                if ops[token][3] == 1:
                    stack.append(ops[token][1](stack.pop()))
                else:
                    b, a = stack.pop(), stack.pop()
                    stack.append(ops[token][1](a, b))
        return stack[0]

    def to_rpn(s):
        output, stack = [], []
        i = 0
        while i < len(s):
            c = s[i]
            if c.isdigit() or c == '.':
                num = []
                while i < len(s) and (s[i].isdigit() or s[i] == '.'):
                    num.append(s[i])
                    i += 1
                output.append(float(''.join(num)) if '.' in num else int(''.join(num)))
                continue
            elif c in {'&', '|'} and i+1 < len(s) and s[i+1] == c:
                op = c*2
                while stack and stack[-1] != '(' and ops[op][0] <= ops.get(stack[-1], (0,))[0]:
                    output.append(stack.pop())
                stack.append(op)
                i += 2
            elif c == '=' and i+1 < len(s) and s[i+1] == '=':
                op = '=='
                while stack and stack[-1] != '(' and ops[op][0] <= ops.get(stack[-1], (0,))[0]:
                    output.append(stack.pop())
                stack.append(op)
                i += 2
            elif c in ops or c in '()':
                if c == '(':
                    stack.append(c)
                elif c == ')':
                    while stack[-1] != '(':
                        output.append(stack.pop())
                    stack.pop()
                else:
                    op = c
                    if i+1 < len(s) and s[i:i+2] in ops:
                        op = s[i:i+2]
                        i += 1
                    while stack and stack[-1] != '(' and ops[op][0] <= ops.get(stack[-1], (0,))[0]:
                        output.append(stack.pop())
                    stack.append(op)
                i += 1
            else:
                raise ValueError(f"非法字符: {c}")
        return output + stack[::-1]

    try:
        expr = expr.replace(' ', '')
        rpn = to_rpn(expr)
        result = eval_rpn(rpn)
        return int(result) if isinstance(result, float) and result.is_integer() else result
    except Exception as e:
        raise ValueError(f"计算错误: {e}")
