# JSCLass
This tool allows developers to easily create classes in Javascript without the verbose prototyping.  It also handles inheritance.   

## Installation

Simply clone this repository into the directoy where you store the javascript files for you project.

## Usage
```javascript
// Create iife wrapper for the JSClass.create function
// Create iife wrapper for the JSClass.create function
(function($class){
  // Create simple class
  $class({
    "className" : "Foo", // Required Name for new Class

    "public" : true, // Optional: places the class in the global space (Default: false)

    /**
     * Optional : Namespace creates a public class definition with this namespace
     * This example would be available at com.oxxmossxxo.Foo or var foo = new com.oxxmossxxo.Foo();
     * when the namespace parameter is used, the class will automatically be public, so the
     * 'public' parameter is not necessary when using namespace
     */
    "namespace" : "com.oxxmossxxo", 

    /**
     * Constructor Method.  The method is called as soon as the object is created
     */
    "_constructor" : function(){
      // Do stuff
      this.name = "foo_name";
    },

    /**
     * Standard method will be publicly available in the class functions prototype
     */  
    "setName" : function(p_name){
      this.name = p_name;
      return this;
    },

    /**
     * Create Class or Static Methods that are accessible without the need to create an object
     */
    "__static__" : {
      "factoryGet" : function(){
        return new Foo();
      }
    },
    /** 
     * Creates constants for the class.  On modern browsers, these definitions will
     * be read-only.  Older browser don't have the Object.defineProperty method so
     * JSClass creates a static property that is writeable
     */
     "__constants__" : {
        "FOO_CONSTANT" : 1
     }
  });

  /**
   * To extend a class, simple use the parents class name
   * If the parent class has a namespace, you must enter the 
   * full namespace for the parent class.
   * The class below doesn't use the 'public' or 'namespace'
   * parameter, so you need to assign this private class to 
   * a variable.
   */
  var Bar = $class("com.oxxmossxxo.Foo",{
    "className" : "Bar",
    /*
     * This subclass has it's own _constructor method, so 
     * JSClass will automatically pass the Parents _constructor
     * method as the first parameter of the sub-classes method
     */
    "_constructor" : function($super){
      // Call parents constructor 
      $super();
      this.name += "_bar";
    },
    /*
     * As with the _constructor method, any method that exists
     * in the parent class will be passed as the first parameter
     * of the sub-classes implementation of that method.  If that
     * method takes other parameter, those will be passed in the
     * second, third, etc parameter spaces.
     */
    "setName" : function($super,name){
      if ( name && name.length ){
        name += "_bar";
      }
      return $super(name);
    }
  });

  // Create instance of Bar
  var testBar = new Bar();
  testBar.setName("test_object");
  console.log(testBar);

}(JSClass.create));
```


## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

Open license, feel free to use it privately or commercially.
