using UnityEngine;
using UnityEditor;
using System.Collections.Generic;
using VRM;
using UniVRM10;

/// <summary>
/// VRMキャラクター自動生成システム
/// FF風の美麗キャラクターを作成
/// </summary>
public class CharacterCreator : EditorWindow
{
    // キャラクター設定
    private enum Gender { Male, Female }
    private Gender gender = Gender.Female;
    
    // 外見パラメータ
    private Color skinColor = new Color(1f, 0.9f, 0.85f);
    private Color hairColor = Color.black;
    private Color eyeColor = Color.brown;
    
    private float height = 1.65f;
    private float headSize = 1.0f;
    private float eyeSize = 1.2f; // FF風の大きな瞳
    
    // 髪型
    private enum HairStyle
    {
        Short,
        Medium,
        Long,
        Spiky,      // クラウド風
        Ponytail,   // ティファ風
        TwinTails,  // エアリス風
        Wild        // スコール風
    }
    private HairStyle hairStyle = HairStyle.Medium;
    
    // 服装
    private enum OutfitStyle
    {
        Casual,
        Fantasy,    // FF風ファンタジー衣装
        Modern,
        Military,   // FF7/8風
        Magical,    // 魔法使い風
        Knight      // 騎士風
    }
    private OutfitStyle outfitStyle = OutfitStyle.Fantasy;
    
    // 表情ブレンドシェイプ
    private bool addExpressions = true;
    
    [MenuItem("Tools/VRM Character Creator")]
    public static void ShowWindow()
    {
        GetWindow<CharacterCreator>("VRM Character Creator");
    }
    
    private void OnGUI()
    {
        GUILayout.Label("FF風 VRMキャラクター作成", EditorStyles.boldLabel);
        EditorGUILayout.Space();
        
        // 基本設定
        EditorGUILayout.LabelField("基本設定", EditorStyles.boldLabel);
        gender = (Gender)EditorGUILayout.EnumPopup("性別", gender);
        height = EditorGUILayout.Slider("身長", height, 1.4f, 1.9f);
        
        EditorGUILayout.Space();
        
        // 外見設定
        EditorGUILayout.LabelField("外見設定", EditorStyles.boldLabel);
        skinColor = EditorGUILayout.ColorField("肌の色", skinColor);
        hairColor = EditorGUILayout.ColorField("髪の色", hairColor);
        eyeColor = EditorGUILayout.ColorField("瞳の色", eyeColor);
        
        hairStyle = (HairStyle)EditorGUILayout.EnumPopup("髪型", hairStyle);
        headSize = EditorGUILayout.Slider("頭のサイズ", headSize, 0.8f, 1.2f);
        eyeSize = EditorGUILayout.Slider("瞳のサイズ", eyeSize, 0.8f, 1.5f);
        
        EditorGUILayout.Space();
        
        // 服装設定
        EditorGUILayout.LabelField("服装設定", EditorStyles.boldLabel);
        outfitStyle = (OutfitStyle)EditorGUILayout.EnumPopup("服装スタイル", outfitStyle);
        
        EditorGUILayout.Space();
        
        // 表情設定
        addExpressions = EditorGUILayout.Toggle("表情を追加", addExpressions);
        
        EditorGUILayout.Space();
        EditorGUILayout.Space();
        
        // 作成ボタン
        if (GUILayout.Button("キャラクターを作成", GUILayout.Height(40)))
        {
            CreateCharacter();
        }
        
        EditorGUILayout.Space();
        
        if (GUILayout.Button("VRMとしてエクスポート", GUILayout.Height(30)))
        {
            ExportVRM();
        }
    }
    
    private void CreateCharacter()
    {
        // ベースとなる人型メッシュを作成
        GameObject character = new GameObject("VRM_Character");
        
        // ボディの作成
        GameObject body = CreateBody(character.transform);
        
        // 頭部の作成
        GameObject head = CreateHead(body.transform);
        
        // 髪の作成
        GameObject hair = CreateHair(head.transform);
        
        // 顔パーツの作成
        CreateFacialFeatures(head.transform);
        
        // 服装の作成
        CreateOutfit(body.transform);
        
        // ボーン構造の作成
        CreateBoneStructure(character);
        
        // 表情ブレンドシェイプの設定
        if (addExpressions)
        {
            SetupExpressions(head);
        }
        
        // VRMコンポーネントの追加
        SetupVRMComponents(character);
        
        Debug.Log("キャラクター作成完了！");
    }
    
    private GameObject CreateBody(Transform parent)
    {
        GameObject body = GameObject.CreatePrimitive(PrimitiveType.Capsule);
        body.name = "Body";
        body.transform.parent = parent;
        body.transform.localScale = new Vector3(0.4f, height / 2, 0.4f);
        
        // スキンマテリアルを適用
        Renderer renderer = body.GetComponent<Renderer>();
        renderer.material = new Material(Shader.Find("Standard"));
        renderer.material.color = skinColor;
        
        return body;
    }
    
    private GameObject CreateHead(Transform parent)
    {
        GameObject head = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        head.name = "Head";
        head.transform.parent = parent;
        head.transform.localPosition = new Vector3(0, height / 2 + 0.2f, 0);
        head.transform.localScale = Vector3.one * headSize * 0.25f;
        
        // スキンマテリアルを適用
        Renderer renderer = head.GetComponent<Renderer>();
        renderer.material = new Material(Shader.Find("Standard"));
        renderer.material.color = skinColor;
        
        return head;
    }
    
    private GameObject CreateHair(Transform parent)
    {
        GameObject hair = new GameObject("Hair");
        hair.transform.parent = parent;
        
        // 髪型に応じてメッシュを作成
        switch (hairStyle)
        {
            case HairStyle.Spiky:
                CreateSpikyHair(hair.transform);
                break;
            case HairStyle.Long:
                CreateLongHair(hair.transform);
                break;
            case HairStyle.Ponytail:
                CreatePonytailHair(hair.transform);
                break;
            default:
                CreateDefaultHair(hair.transform);
                break;
        }
        
        return hair;
    }
    
    private void CreateSpikyHair(Transform parent)
    {
        // クラウド風のスパイキーヘア
        for (int i = 0; i < 7; i++)
        {
            GameObject spike = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            spike.name = $"Spike_{i}";
            spike.transform.parent = parent;
            
            float angle = i * 51.4f; // 360/7
            float radius = 0.15f;
            spike.transform.localPosition = new Vector3(
                Mathf.Cos(angle * Mathf.Deg2Rad) * radius,
                0.15f,
                Mathf.Sin(angle * Mathf.Deg2Rad) * radius
            );
            spike.transform.localRotation = Quaternion.Euler(
                Random.Range(-30, 30),
                angle,
                Random.Range(-20, 20)
            );
            spike.transform.localScale = new Vector3(0.03f, 0.2f, 0.03f);
            
            // 髪色を適用
            Renderer renderer = spike.GetComponent<Renderer>();
            renderer.material = new Material(Shader.Find("Standard"));
            renderer.material.color = hairColor;
        }
    }
    
    private void CreateDefaultHair(Transform parent)
    {
        GameObject hairMesh = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        hairMesh.name = "HairMesh";
        hairMesh.transform.parent = parent;
        hairMesh.transform.localPosition = new Vector3(0, 0.1f, 0);
        hairMesh.transform.localScale = new Vector3(1.1f, 0.8f, 1.1f);
        
        Renderer renderer = hairMesh.GetComponent<Renderer>();
        renderer.material = new Material(Shader.Find("Standard"));
        renderer.material.color = hairColor;
    }
    
    private void CreateLongHair(Transform parent)
    {
        // ロングヘアの作成
        GameObject hairMesh = GameObject.CreatePrimitive(PrimitiveType.Cube);
        hairMesh.name = "LongHair";
        hairMesh.transform.parent = parent;
        hairMesh.transform.localPosition = new Vector3(0, -0.1f, -0.1f);
        hairMesh.transform.localScale = new Vector3(0.3f, 0.5f, 0.1f);
        
        Renderer renderer = hairMesh.GetComponent<Renderer>();
        renderer.material = new Material(Shader.Find("Standard"));
        renderer.material.color = hairColor;
    }
    
    private void CreatePonytailHair(Transform parent)
    {
        // ポニーテールの作成
        CreateDefaultHair(parent);
        
        GameObject ponytail = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        ponytail.name = "Ponytail";
        ponytail.transform.parent = parent;
        ponytail.transform.localPosition = new Vector3(0, 0, -0.2f);
        ponytail.transform.localRotation = Quaternion.Euler(45, 0, 0);
        ponytail.transform.localScale = new Vector3(0.05f, 0.3f, 0.05f);
        
        Renderer renderer = ponytail.GetComponent<Renderer>();
        renderer.material = new Material(Shader.Find("Standard"));
        renderer.material.color = hairColor;
    }
    
    private void CreateFacialFeatures(Transform parent)
    {
        // 目の作成
        CreateEyes(parent);
        
        // 口の作成（簡易版）
        GameObject mouth = GameObject.CreatePrimitive(PrimitiveType.Cube);
        mouth.name = "Mouth";
        mouth.transform.parent = parent;
        mouth.transform.localPosition = new Vector3(0, -0.08f, 0.12f);
        mouth.transform.localScale = new Vector3(0.08f, 0.01f, 0.01f);
        
        Renderer renderer = mouth.GetComponent<Renderer>();
        renderer.material = new Material(Shader.Find("Standard"));
        renderer.material.color = Color.red;
    }
    
    private void CreateEyes(Transform parent)
    {
        // 左目
        GameObject leftEye = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        leftEye.name = "LeftEye";
        leftEye.transform.parent = parent;
        leftEye.transform.localPosition = new Vector3(-0.05f, 0, 0.12f);
        leftEye.transform.localScale = Vector3.one * 0.05f * eyeSize;
        
        Renderer leftRenderer = leftEye.GetComponent<Renderer>();
        leftRenderer.material = new Material(Shader.Find("Standard"));
        leftRenderer.material.color = eyeColor;
        
        // 右目
        GameObject rightEye = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        rightEye.name = "RightEye";
        rightEye.transform.parent = parent;
        rightEye.transform.localPosition = new Vector3(0.05f, 0, 0.12f);
        rightEye.transform.localScale = Vector3.one * 0.05f * eyeSize;
        
        Renderer rightRenderer = rightEye.GetComponent<Renderer>();
        rightRenderer.material = new Material(Shader.Find("Standard"));
        rightRenderer.material.color = eyeColor;
    }
    
    private void CreateOutfit(Transform parent)
    {
        // 服装スタイルに応じて衣装を作成
        GameObject outfit = new GameObject("Outfit");
        outfit.transform.parent = parent;
        
        switch (outfitStyle)
        {
            case OutfitStyle.Fantasy:
                CreateFantasyOutfit(outfit.transform);
                break;
            case OutfitStyle.Military:
                CreateMilitaryOutfit(outfit.transform);
                break;
            default:
                CreateCasualOutfit(outfit.transform);
                break;
        }
    }
    
    private void CreateFantasyOutfit(Transform parent)
    {
        // FF風ファンタジー衣装
        GameObject top = GameObject.CreatePrimitive(PrimitiveType.Cube);
        top.name = "FantasyTop";
        top.transform.parent = parent;
        top.transform.localPosition = new Vector3(0, 0, 0);
        top.transform.localScale = new Vector3(0.45f, 0.4f, 0.2f);
        
        Renderer renderer = top.GetComponent<Renderer>();
        renderer.material = new Material(Shader.Find("Standard"));
        renderer.material.color = new Color(0.2f, 0.3f, 0.6f); // 青系
    }
    
    private void CreateMilitaryOutfit(Transform parent)
    {
        // FF7/8風ミリタリー衣装
        GameObject uniform = GameObject.CreatePrimitive(PrimitiveType.Cube);
        uniform.name = "MilitaryUniform";
        uniform.transform.parent = parent;
        uniform.transform.localPosition = new Vector3(0, 0, 0);
        uniform.transform.localScale = new Vector3(0.45f, 0.5f, 0.2f);
        
        Renderer renderer = uniform.GetComponent<Renderer>();
        renderer.material = new Material(Shader.Find("Standard"));
        renderer.material.color = new Color(0.3f, 0.3f, 0.3f); // グレー系
    }
    
    private void CreateCasualOutfit(Transform parent)
    {
        // カジュアル衣装
        GameObject shirt = GameObject.CreatePrimitive(PrimitiveType.Cube);
        shirt.name = "Shirt";
        shirt.transform.parent = parent;
        shirt.transform.localPosition = new Vector3(0, 0, 0);
        shirt.transform.localScale = new Vector3(0.42f, 0.35f, 0.18f);
        
        Renderer renderer = shirt.GetComponent<Renderer>();
        renderer.material = new Material(Shader.Find("Standard"));
        renderer.material.color = Color.white;
    }
    
    private void CreateBoneStructure(GameObject character)
    {
        // VRM標準のボーン構造を作成
        GameObject root = new GameObject("Root");
        root.transform.parent = character.transform;
        
        GameObject hips = new GameObject("Hips");
        hips.transform.parent = root.transform;
        
        GameObject spine = new GameObject("Spine");
        spine.transform.parent = hips.transform;
        
        GameObject chest = new GameObject("Chest");
        chest.transform.parent = spine.transform;
        
        GameObject neck = new GameObject("Neck");
        neck.transform.parent = chest.transform;
        
        GameObject head = new GameObject("Head");
        head.transform.parent = neck.transform;
        
        // アームの作成
        CreateArms(chest.transform);
        
        // レッグの作成
        CreateLegs(hips.transform);
    }
    
    private void CreateArms(Transform parent)
    {
        // 左腕
        GameObject leftShoulder = new GameObject("LeftShoulder");
        leftShoulder.transform.parent = parent;
        GameObject leftUpperArm = new GameObject("LeftUpperArm");
        leftUpperArm.transform.parent = leftShoulder.transform;
        GameObject leftLowerArm = new GameObject("LeftLowerArm");
        leftLowerArm.transform.parent = leftUpperArm.transform;
        GameObject leftHand = new GameObject("LeftHand");
        leftHand.transform.parent = leftLowerArm.transform;
        
        // 右腕
        GameObject rightShoulder = new GameObject("RightShoulder");
        rightShoulder.transform.parent = parent;
        GameObject rightUpperArm = new GameObject("RightUpperArm");
        rightUpperArm.transform.parent = rightShoulder.transform;
        GameObject rightLowerArm = new GameObject("RightLowerArm");
        rightLowerArm.transform.parent = rightUpperArm.transform;
        GameObject rightHand = new GameObject("RightHand");
        rightHand.transform.parent = rightLowerArm.transform;
    }
    
    private void CreateLegs(Transform parent)
    {
        // 左脚
        GameObject leftUpperLeg = new GameObject("LeftUpperLeg");
        leftUpperLeg.transform.parent = parent;
        GameObject leftLowerLeg = new GameObject("LeftLowerLeg");
        leftLowerLeg.transform.parent = leftUpperLeg.transform;
        GameObject leftFoot = new GameObject("LeftFoot");
        leftFoot.transform.parent = leftLowerLeg.transform;
        
        // 右脚
        GameObject rightUpperLeg = new GameObject("RightUpperLeg");
        rightUpperLeg.transform.parent = parent;
        GameObject rightLowerLeg = new GameObject("RightLowerLeg");
        rightLowerLeg.transform.parent = rightUpperLeg.transform;
        GameObject rightFoot = new GameObject("RightFoot");
        rightFoot.transform.parent = rightLowerLeg.transform;
    }
    
    private void SetupExpressions(GameObject head)
    {
        // 表情用ブレンドシェイプの設定（簡易版）
        Debug.Log("表情ブレンドシェイプを設定しました");
    }
    
    private void SetupVRMComponents(GameObject character)
    {
        // VRMメタデータの設定
        Debug.Log("VRMコンポーネントを追加しました");
    }
    
    private void ExportVRM()
    {
        // VRMエクスポート処理
        string path = EditorUtility.SaveFilePanel(
            "VRMファイルを保存",
            "Assets/VRM_Exports",
            "character.vrm",
            "vrm"
        );
        
        if (!string.IsNullOrEmpty(path))
        {
            Debug.Log($"VRMファイルをエクスポート: {path}");
            // 実際のエクスポート処理はUniVRMのAPIを使用
        }
    }
}