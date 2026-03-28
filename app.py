from flask import Flask, request, jsonify
import ast
import traceback
import time
import os

app = Flask(__name__)

class CodeAnalyzer:
    def analyze(self, code):
        errors = []
        
        # 检查语法错误
        syntax_errors = self.check_syntax_errors(code)
        errors.extend(syntax_errors)
        
        if not syntax_errors:
            # 检查未定义变量
            undefined_vars = self.check_undefined_variables(code)
            errors.extend(undefined_vars)
            
            # 检查类型错误
            type_errors = self.check_type_errors(code)
            errors.extend(type_errors)
            
            # 检查逻辑错误
            logic_errors = self.check_logic_errors(code)
            errors.extend(logic_errors)
            
            # 检查除零错误
            zero_division_errors = self.check_zero_division_errors(code)
            errors.extend(zero_division_errors)
            
            # 检查索引错误
            index_errors = self.check_index_errors(code)
            errors.extend(index_errors)
            
            # 检查键错误
            key_errors = self.check_key_errors(code)
            errors.extend(key_errors)
            
            # 检查属性错误
            attribute_errors = self.check_attribute_errors(code)
            errors.extend(attribute_errors)
            
            # 检查文件错误
            file_errors = self.check_file_errors(code)
            errors.extend(file_errors)
        
        return errors
    
    def check_syntax_errors(self, code):
        errors = []
        try:
            ast.parse(code)
        except SyntaxError as e:
            error_msg = str(e)
            line = e.lineno if hasattr(e, 'lineno') else 1
            col = e.offset if hasattr(e, 'offset') else 0
            
            if 'unexpected EOF while parsing' in error_msg:
                errors.append({
                    'line': line,
                    'type': 'syntax',
                    'typeName': '语法错误',
                    'reason': '语法错误：意外的文件结束',
                    'fix': '检查代码是否有未闭合的括号或引号',
                    'knowledge': '在Python中，所有的括号、引号必须成对出现。'
                })
            elif 'invalid syntax' in error_msg:
                errors.append({
                    'line': line,
                    'type': 'syntax',
                    'typeName': '语法错误',
                    'reason': f'语法错误：{error_msg}',
                    'fix': '检查该行的语法是否正确',
                    'knowledge': 'Python有严格的语法规则，需要确保代码符合Python语法。'
                })
            else:
                errors.append({
                    'line': line,
                    'type': 'syntax',
                    'typeName': '语法错误',
                    'reason': f'语法错误：{error_msg}',
                    'fix': '检查该行的语法是否正确',
                    'knowledge': 'Python有严格的语法规则，需要确保代码符合Python语法。'
                })
        except Exception as e:
            errors.append({
                'line': 1,
                'type': 'syntax',
                'typeName': '语法错误',
                'reason': f'语法错误：{str(e)}',
                'fix': '检查代码的语法是否正确',
                'knowledge': 'Python有严格的语法规则，需要确保代码符合Python语法。'
            })
        return errors
    
    def check_undefined_variables(self, code):
        errors = []
        try:
            tree = ast.parse(code)
            
            # 收集已定义的变量
            defined_vars = set()
            builtin_funcs = {'print', 'len', 'range', 'input', 'open', 'sum', 'int', 'float', 'str', 'enumerate', 'list', 'dict', 'tuple', 'set'}
            keywords = {'def', 'if', 'else', 'for', 'while', 'return', 'True', 'False', 'None', 'in', 'elif', 'and', 'or', 'not', 'f'}
            
            class VariableCollector(ast.NodeVisitor):
                def visit_FunctionDef(self, node):
                    defined_vars.add(node.name)
                    for arg in node.args.args:
                        defined_vars.add(arg.arg)
                    self.generic_visit(node)
                
                def visit_Assign(self, node):
                    for target in node.targets:
                        if isinstance(target, ast.Name):
                            defined_vars.add(target.id)
                    self.generic_visit(node)
                
                def visit_For(self, node):
                    if isinstance(node.target, ast.Name):
                        defined_vars.add(node.target.id)
                    elif isinstance(node.target, ast.Tuple):
                        for elt in node.target.elts:
                            if isinstance(elt, ast.Name):
                                defined_vars.add(elt.id)
                    self.generic_visit(node)
            
            collector = VariableCollector()
            collector.visit(tree)
            
            # 检查未定义的变量
            class UndefinedVariableChecker(ast.NodeVisitor):
                def visit_Name(self, node):
                    if isinstance(node.ctx, ast.Load) and node.id not in defined_vars and node.id not in builtin_funcs and node.id not in keywords:
                        errors.append({
                            'line': node.lineno,
                            'type': 'exception',
                            'typeName': '变量未定义',
                            'reason': f'变量{node.id}未定义',
                            'fix': f'先定义变量{node.id}',
                            'knowledge': '在Python中，使用未定义的变量会引发NameError异常。'
                        })
                    self.generic_visit(node)
            
            checker = UndefinedVariableChecker()
            checker.visit(tree)
        except Exception as e:
            pass
        return errors
    
    def check_type_errors(self, code):
        errors = []
        try:
            tree = ast.parse(code)
            
            class TypeErrorChecker(ast.NodeVisitor):
                def visit_BinOp(self, node):
                    if isinstance(node.op, ast.Add):
                        # 检查字符串和数字相加
                        if (isinstance(node.left, ast.Constant) and isinstance(node.left.value, str) and
                            isinstance(node.right, ast.Constant) and isinstance(node.right.value, (int, float))):
                            errors.append({
                                'line': node.lineno,
                                'type': 'exception',
                                'typeName': '类型错误',
                                'reason': '尝试将字符串和数字相加',
                                'fix': '使用str()函数将数字转换为字符串后再相加',
                                'knowledge': '在Python中，不能直接将字符串和数字相加，需要先进行类型转换。'
                            })
                        elif (isinstance(node.left, ast.Constant) and isinstance(node.left.value, (int, float)) and
                              isinstance(node.right, ast.Constant) and isinstance(node.right.value, str)):
                            errors.append({
                                'line': node.lineno,
                                'type': 'exception',
                                'typeName': '类型错误',
                                'reason': '尝试将数字和字符串相加',
                                'fix': '使用str()函数将数字转换为字符串后再相加',
                                'knowledge': '在Python中，不能直接将数字和字符串相加，需要先进行类型转换。'
                            })
                    self.generic_visit(node)
            
            checker = TypeErrorChecker()
            checker.visit(tree)
        except Exception as e:
            pass
        return errors
    
    def check_logic_errors(self, code):
        errors = []
        try:
            tree = ast.parse(code)
            
            # 检查函数是否有return语句
            class FunctionReturnChecker(ast.NodeVisitor):
                def visit_FunctionDef(self, node):
                    has_return = False
                    for n in ast.walk(node):
                        if isinstance(n, ast.Return):
                            has_return = True
                            break
                    if not has_return:
                        errors.append({
                            'line': node.lineno,
                            'type': 'logic',
                            'typeName': '逻辑错误',
                            'reason': '函数缺少return语句，将返回None',
                            'fix': '添加return语句返回计算结果',
                            'knowledge': '在Python中，如果函数没有return语句，会默认返回None。'
                        })
                    self.generic_visit(node)
            
            # 检查奇偶性判断逻辑错误
            class LogicErrorChecker(ast.NodeVisitor):
                def visit_If(self, node):
                    if isinstance(node.test, ast.Compare):
                        if isinstance(node.test.ops[0], ast.Eq):
                            if isinstance(node.test.comparators[0], ast.Constant) and node.test.comparators[0].value == 1:
                                if isinstance(node.test.left, ast.BinOp):
                                    if isinstance(node.test.left.op, ast.Mod):
                                        if isinstance(node.test.left.right, ast.Constant) and node.test.left.right.value == 2:
                                            # 检查变量名是否暗示这是一个偶数判断
                                            if isinstance(node.test.left.left, ast.Name):
                                                var_name = node.test.left.left.id
                                                if 'even' in var_name.lower():
                                                    errors.append({
                                                        'line': node.lineno,
                                                        'type': 'logic',
                                                        'typeName': '逻辑错误',
                                                        'reason': '奇偶性判断逻辑错误，当n % 2 == 1时表示n是奇数，而不是偶数',
                                                        'fix': '将条件改为n % 2 == 0，这样当余数为0时表示n是偶数',
                                                        'knowledge': '在Python中，判断一个数是否为偶数应该使用n % 2 == 0，因为偶数能被2整除，余数为0；而奇数除以2的余数为1。'
                                                    })
                    self.generic_visit(node)
            
            return_checker = FunctionReturnChecker()
            return_checker.visit(tree)
            
            logic_checker = LogicErrorChecker()
            logic_checker.visit(tree)
        except Exception as e:
            pass
        return errors
    
    def check_zero_division_errors(self, code):
        errors = []
        try:
            tree = ast.parse(code)
            
            class ZeroDivisionChecker(ast.NodeVisitor):
                def visit_BinOp(self, node):
                    if isinstance(node.op, ast.Div) or isinstance(node.op, ast.FloorDiv):
                        if isinstance(node.right, ast.Constant) and node.right.value == 0:
                            errors.append({
                                'line': node.lineno,
                                'type': 'exception',
                                'typeName': '除零错误',
                                'reason': '尝试除以零',
                                'fix': '确保除数不为零',
                                'knowledge': '在Python中，尝试除以零会引发ZeroDivisionError异常。'
                            })
                    self.generic_visit(node)
            
            checker = ZeroDivisionChecker()
            checker.visit(tree)
        except Exception as e:
            pass
        return errors
    
    def check_index_errors(self, code):
        errors = []
        try:
            tree = ast.parse(code)
            
            class IndexErrorChecker(ast.NodeVisitor):
                def visit_Subscript(self, node):
                    if isinstance(node.slice, ast.Index):
                        # 检查是否使用len()作为索引
                        if isinstance(node.slice.value, ast.Call):
                            if isinstance(node.slice.value.func, ast.Name) and node.slice.value.func.id == 'len':
                                errors.append({
                                    'line': node.lineno,
                                    'type': 'exception',
                                    'typeName': '索引错误',
                                    'reason': '可能使用了len()作为索引，这会超出范围',
                                    'fix': '使用len()-1作为最后一个元素的索引',
                                    'knowledge': '在Python中，列表的索引从0开始，最后一个元素的索引是len()-1。'
                                })
                    self.generic_visit(node)
            
            checker = IndexErrorChecker()
            checker.visit(tree)
        except Exception as e:
            pass
        return errors
    
    def check_key_errors(self, code):
        errors = []
        try:
            tree = ast.parse(code)
            
            class KeyErrorChecker(ast.NodeVisitor):
                def visit_Subscript(self, node):
                    # 检查字典键访问
                    if isinstance(node.value, ast.Dict):
                        errors.append({
                            'line': node.lineno,
                            'type': 'exception',
                            'typeName': '键错误',
                            'reason': '可能访问字典中不存在的键',
                            'fix': '先检查键是否存在，或使用get()方法',
                            'knowledge': '在Python中，访问字典中不存在的键会引发KeyError异常。'
                        })
                    self.generic_visit(node)
            
            checker = KeyErrorChecker()
            checker.visit(tree)
        except Exception as e:
            pass
        return errors
    
    def check_attribute_errors(self, code):
        errors = []
        try:
            tree = ast.parse(code)
            
            class AttributeErrorChecker(ast.NodeVisitor):
                def visit_Attribute(self, node):
                    # 检查常见的方法名错误
                    if isinstance(node.attr, str):
                        if node.attr == 'appendd':
                            errors.append({
                                'line': node.lineno,
                                'type': 'exception',
                                'typeName': '属性错误',
                                'reason': '方法名写错 appendd → append',
                                'fix': '使用正确的方法名 append',
                                'knowledge': '在Python中，调用对象不存在的方法会引发AttributeError异常。'
                            })
                    self.generic_visit(node)
            
            checker = AttributeErrorChecker()
            checker.visit(tree)
        except Exception as e:
            pass
        return errors
    
    def check_file_errors(self, code):
        errors = []
        try:
            tree = ast.parse(code)
            
            class FileErrorChecker(ast.NodeVisitor):
                def visit_Call(self, node):
                    if isinstance(node.func, ast.Name) and node.func.id == 'open':
                        errors.append({
                            'line': node.lineno,
                            'type': 'exception',
                            'typeName': '文件错误',
                            'reason': '可能打开不存在的文件',
                            'fix': '检查文件路径或捕获异常',
                            'knowledge': '在Python中，尝试打开不存在的文件会引发FileNotFoundError异常。'
                        })
                    self.generic_visit(node)
            
            checker = FileErrorChecker()
            checker.visit(tree)
        except Exception as e:
            pass
        return errors

class LearningData:
    def __init__(self):
        self.data = {
            'exercises': [],
            'errorStats': {},
            'skillLevels': {
                '基础语法': 0,
                '函数定义': 0,
                '数据类型': 0,
                '逻辑控制': 0,
                '异常处理': 0
            },
            'lastUpdated': time.time()
        }
    
    def record_exercise(self, code, errors):
        # 添加练习记录
        self.data['exercises'].append({
            'id': 'ex' + str(int(time.time() * 1000)),
            'code': code,
            'errors': errors,
            'timestamp': time.time(),
            'fixed': False
        })
        
        # 更新错误统计
        for error in errors:
            if error['typeName'] in self.data['errorStats']:
                self.data['errorStats'][error['typeName']] += 1
            else:
                self.data['errorStats'][error['typeName']] = 1
        
        # 更新技能水平
        self.update_skill_levels(errors)
        
        # 更新时间戳
        self.data['lastUpdated'] = time.time()
        
        return self.data
    
    def update_skill_levels(self, errors):
        # 根据错误类型更新对应技能的水平
        skill_map = {
            '语法错误': '基础语法',
            '缩进错误': '基础语法',
            '变量未定义': '基础语法',
            '类型错误': '数据类型',
            '逻辑错误': '逻辑控制',
            '除零错误': '逻辑控制',
            '索引错误': '数据类型',
            '键错误': '数据类型',
            '属性错误': '数据类型',
            '文件错误': '异常处理'
        }
        
        for error in errors:
            if error['typeName'] in skill_map:
                skill = skill_map[error['typeName']]
                # 错误会降低技能水平
                self.data['skillLevels'][skill] = max(0, self.data['skillLevels'][skill] - 5)
        
        # 每次练习都会提升所有技能的水平
        for skill in self.data['skillLevels']:
            self.data['skillLevels'][skill] = min(100, self.data['skillLevels'][skill] + 2)

# 创建分析器和学习数据实例
analyzer = CodeAnalyzer()
learning_data = LearningData()

@app.route('/analyze', methods=['POST'])
def analyze_code():
    try:
        data = request.json
        code = data.get('code', '')
        error = data.get('error', '')
        
        if not code:
            return jsonify({
                'success': False,
                'message': '请输入代码'
            })
        
        # 分析代码
        errors = analyzer.analyze(code)
        
        # 记录练习数据
        learning_data.record_exercise(code, errors)
        
        if errors:
            return jsonify({
                'success': False,
                'errors': errors
            })
        else:
            return jsonify({
                'success': True,
                'message': '代码分析完成，未检测到明显错误。'
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'分析过程中出现错误: {str(e)}'
        })

@app.route('/learning-data', methods=['GET'])
def get_learning_data():
    try:
        return jsonify(learning_data.data)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'获取学习数据失败: {str(e)}'
        })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
