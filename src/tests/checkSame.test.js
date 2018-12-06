//unit tests for module that checks unix command equivalence

const checkSame = require('../checkSame');

describe("Testing stripping flags from commands",() => {

    test("Strip flags from ls -al command", ()=> {
        expect(checkSame.stripFlags("ls -al")).toBe("ls");
    })

    test("Strip flags from cat test1 -A command", ()=> {
        expect(checkSame.stripFlags("cat test1 -A")).toBe("cat test1");
    }) 
    
    test("Strip flags from ls test command", ()=> {
        expect(checkSame.stripFlags("ls test")).toBe("ls test");
    })

    test("Get flags from command node --version", () => {
        expect(checkSame.stripFlags("node --version")).toBe("node");
    })

    test("Get flags from command ls -l --all", () => {
        expect(checkSame.stripFlags("ls -l --all")).toBe("ls")
    })


})

describe("Testing returning flags from commands", () => {

    test("Get flags from command ls -al", ()=> {
        expect(checkSame.getFlags("ls -al")).toEqual(['a','l'])
    })

    test("Get flags from command node --version", () => {
        expect(checkSame.getFlags("node --version")).toEqual(["version"])
    })

    test("Get flags from command ls -l --all", () => {
        expect(checkSame.getFlags("ls -l --all")).toEqual(["l","all"])
    })

    test("Get flags from command ls -la are in expected order in array", () => {
        expect(checkSame.getFlags("ls -la")).toEqual(["l","a"])
    })

    test("Get flags grouped signly vs multiply ls -al vs ls -a -l",()=> {
        expect(checkSame.getFlags("ls -a -l")).toEqual(["a","l"])
    })

})

describe("Testing top level call to checkSame", () => {
    
    test("Command ls same as ls ?", ()=> {
        expect(checkSame.checkSame("ls","ls")).toBe(true);
    })

    test("Command ls -al same as ls -al ?", ()=> {
        expect(checkSame.checkSame("ls -al","ls -al")).toBe(true);
    })


    test("Command ls -la same as ls -al ?", ()=> {
        expect(checkSame.checkSame("ls -la","ls -al")).toBe(true);
    })  

    test("Command ls -l NOT same as ls -al ?", ()=> {
        expect(checkSame.checkSame("ls -l","ls -al")).toBe(false);
    })

    test("Command node --version same as node --version ?", ()=> {
        expect(checkSame.checkSame("node --version","node --version")).toBe(true);
    })

    test("Command cat test1 -n same as cat -n test1?", () => {
        expect(checkSame.checkSame("cat test1 -n","cat -n test1")).toBe(true);
    })

    test("Command cat > text same as cat   >   text?", ()=> {
        expect(checkSame.checkSame("cat > text","cat   >   text")).toBe(true);
    })

    test("Command cd ~ same as cd   ~", ()=> {
        expect(checkSame.checkSame("cd ~","cd   ~")).toBe(true);
    })

    test("Command ls NOT same as ls -al", ()=> {
        expect(checkSame.checkSame("ls","ls -al")).toBe(false);
    })

    test("Testing comparing differently grouped flags ie ls -al vs ls -a -l", ()=> {
        expect(checkSame.checkSame("ls -al","ls -a -l")).toBe(true);
    })

    

    

})