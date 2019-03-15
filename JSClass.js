/**
 * JSClass Easy Class Creator
 * Simplifies OOP in Javascript by handling
 * prototyping and inheritance while the developer
 * can focus on functionality  
 *
 * @author Chris Moss
 */
(function(g){

  var _excludeProperties = [
    "__static__",
    "__constants__"
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

  function buildStaticMethods(func,def,parent){
    if ( !parent ){
      parent = {};
    }
    var skip = [];
    var staticMethods = def.__static__ || null;
    if ( staticMethods && func && typeof func === "function" ){
      if ( staticMethods && typeof staticMethods === "object" ){
        each(staticMethods,function(method,methodDef){
          if ( parent.hasOwnProperty(method) && typeof parent[method] === "function" ){
            skip.push(method);
            func[method] = (function($super, m){
              return function(){
                [].unshift.call(arguments,$super);
                return m.apply(null, arguments);
              };
            }(parent[method],methodDef));
          } else {
            func[method] = methodDef;
          }
        });
      }
    }
    for( var method in parent ){
      if ( skip.indexOf(method) > -1 ){
        continue;
      }
      if ( parent.hasOwnProperty(method) ){
        if ( typeof parent[method] === "function" ){
          func[method] = function(){
            return parent[method].apply(null, arguments);
          };
        } else {
          func[method] = parent[method];
        }
      }
    }
  }

  function buildMethods(func,methods,parent){
    if ( !parent ){
      parent = {};
    }
    var hasParent = false;
    if (typeof parent === "function") {
      func.prototype = Object.create(parent.prototype);
      hasParent = true;
    }
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
          func.prototype[key] = (function(method,methodFunction){
            return function(){
              var $super = parent.prototype[method];
              if ( $super && typeof $super === "function" ){
                [].unshift.call(arguments,$super.bind(this));
              }
              return methodFunction.apply(this,arguments);
            };
          }(key,item));
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
        // Attempt to use Modern Method
        try {
          Object.defineProperty(func,name,{
            "value" : value
          });
        } catch( e ){
          // On failure, assign value as static
          func[name] = value;
        }
      });
    }
  }

  function parseConstructor(def){
    var _constructor = def._constructor || null;
    if ( typeof _constructor !== "function" ){
      _constructor = null;
    }
    return _constructor;
  }

  function create(parent, definition){
    var _parent = null, 
        _def = {};
    if (parent && definition){
      if ( typeof parent === "function" ){
        _parent = parent;
      } 
      _def = definition || {};
    }
    else {
      _def = parent || {};
    }
    var _constructor = parseConstructor(_def);

    if ( typeof _parent !== "function" ) {
      _parent = null;
    }

    var ClassDef = (function(){
      return function(){
        var callConstruct = true;
        if ( _parent !== null ){
          _parent.apply(this,arguments);
          if ( _parent.prototype && _parent.prototype._constructor ){
            callConstruct = false;
          }
        }
        if ( _constructor !== null && callConstruct ){
          this._constructor.apply(this,arguments);
        }
      };
    }());

    buildMethods(ClassDef,_def,_parent);
    buildStaticMethods(ClassDef,_def,_parent);
    buildConstants(ClassDef,_def,_parent);

    return ClassDef;
  }

  // Make JSClass Globally Accessible
  g.JSClass = {
    "util": {
      "extend" : extend,
      "each" : each
    },
    "create" : create
  };

}(this));
