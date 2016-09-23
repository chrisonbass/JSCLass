(function(g){
  var _excludeProperties = [
    "parentNamespace",
    "namespace",
    "className",
    "addToGlobal",
    "__static__"
  ];
  function extend(target, source){
    var prop;
    target = target || {};
    for ( prop in source) {
      if ( source.hasOwnProperty(prop) ){
        if (typeof source[prop] === 'object' && source[prop].constructor !== Array ) {
          target[prop] = extend(target[prop], source[prop]);
        } else {
          target[prop] = source[prop];
        }
      }
    }
    return target;
  }

  function each(obj,callable){
    var i,
        ret;
    if ( obj && typeof obj === "object" && obj.constructor !== Array ){
      for( i in obj ){
        if ( obj.hasOwnProperty(i) ){
          ret = null;
          ret = callable(i,obj[i]);
          if ( ret === false ){
            break;
          }
        }
      }
    }
    else if ( obj && typeof obj === "object" ){
      for( i = 0; i < obj.length; i++ ){
          ret = null;
          ret = callable(i,obj[i]);
          if ( ret === false ){
            break;
          }
      }
    }
  }

  function buildStaticMethods(func,def){
    var staticMethods = def.__static__ || null;
    if ( staticMethods && func && typeof func === "function" ){
      if ( staticMethods && typeof staticMethods === "object" ){
        each(staticMethods,function(method,methodDef){
          func[method] = methodDef;
        });
      }
    }
  }

  function buildMethods(func,methods,parent){
    if ( !parent ){
      parent = {};
    }
    var hasParent = false;
    if (typeof parent === "function") {
      extend(func.prototype, parent.prototype);
      hasParent = true;
    }
    func.prototype.constructor = func;
    if ( func && methods && parent ){
      var v;
      each(methods,function(key,item){
        if ( _excludeProperties.indexOf(key) >= 0 ){
          return true;
        }
        if ( 
          hasParent && 
          parent.prototype.hasOwnProperty(key) && 
          typeof item === "function" 
        ){ 
          v = (function(method,methodFunction){
            return function(){
              var $super = parent.prototype[method];
              if ( $super && typeof $super === "function" ){
                [].unshift.call(arguments,$super.bind(this));
              }
              return methodFunction.apply(this,arguments);
            };
          }(key,item));
          func.prototype[key] = v; 
        } else if ( typeof item === "function" ){
          func.prototype[key] = item;
        }
      });
    }
  }

  function buildConstants(func,def){
    var c = def.__constants__ || null;
    if ( c && func && typeof func === "function" ){
      each(c,function(name,value){
        Object.defineProperty(func,name,{
          "value" : value
        });
      });
    }
  }

  function parseConstructor(def){
    var _construct = def._constructor || null;
    if ( 
      _construct 
      && typeof _construct === "string" 
      && g[_construct] 
      && typeof g[_construct] === "function" 
    ){
      _construct = g[_construct];     
    }
    return _construct;
  }

  function create(parent, definition){
    var _parent = null, 
        _def = {};
    if (parent && definition){
      if ( typeof parent === "function" ){
        _parent = parent;
      } 
      else if ( typeof parent === "string" ){
        _parent = parent;
      }
      _def = definition || {};
    }
    else {
      _def = parent || {};
    }
    var _class = _def.className || null,
        _global = _def.addToGlobal || false,
        _construct = parseConstructor(_def),
        _namespace = _def.namespace || null,
        parentNamespace = null,
        parentFunc = null,
        i;
    if ( _namespace && typeof _namespace === "string" ){
      _global = true;
    } else {
      _namespace = null;
    }
    
    if ( !_class ){
      throw "The provided definition is missing the required 'className' value.";
    }

    /*
    if ( _construct && typeof _construct === "function" ){
      _construct = "this._constructor.apply(this,arguments);\n";
    }
    */

    if (_parent && typeof _parent === "string" ){
      parentNamespace = _parent.split(/\./);
      parentFunc = null;
      i = 0;
      for( i = 0; i < parentNamespace.length; i++ ){
        parentFunc = i > 0 ? (parentFunc[parentNamespace[i]] || null) : (g[parentNamespace[i]] || null );
        if ( parentFunc === null ){
          break;
        }
      }
      if ( parentFunc ){
        parentNamespace = _parent;
        _parent = parentFunc;
      } else {
        throw "Could not find " + _parent + " in global scope";
      }
    } else if ( typeof _parent !== "function" ) {
      _parent = null;
    }

    var main = function(){
      if ( _parent ){
        _parent.apply(this,arguments);
      } 
      if ( _construct && typeof _construct === "function" ){
        if ( _parent && typeof _parent.prototype._constructor === "function"){
          return;
        }
        this._constructor(arguments);
      }
    };
    buildMethods(main,_def,_parent);
    buildStaticMethods(main,_def);
    buildConstants(main,_def);
    if ( _global ){
      if ( _namespace ){
        var ns = _namespace.trim().replace(/\.$/,'').split(/\./g),
            space = g;
        if ( ns && ns.length ){
          for( i = 0; i < ns.length; i++ ){
            if ( !space[ns[i]] ){
              space[ns[i]] = {};
            } 
            space = space[ns[i]];
          }
          if ( typeof space === "object" ){
            space[_class] = main;
          } else {
            g[_class] = main;
          }
        }
      }
      g[_class] = main;
    }
    return main;
  }

  function uniqid(length,number_only){
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
      numbers = '0123456789',
      len = length || 10,
      result = "",
      i = 0;
    if ( !length ){ length = 10; }
    if ( number_only ){
      for (i = len; i > 0; --i){ result += numbers[Math.round(Math.random() * (numbers.length - 1))]; }
    }
    else{
      for (i = len; i > 0; --i){ result += chars[Math.round(Math.random() * (chars.length - 1))]; }
    }
    return result;
  }

  // Define JSClass Namespace
  g.JSClass = {
    "util": {
      "uniqid" : uniqid,
      "extend" : extend,
      "each" : each
    },

    "tmp" : {},

    "create" : create,
  };
}(this));
